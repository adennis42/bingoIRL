import {
  getFirebaseErrorMessage,
  logError,
  FirebaseError,
  PermissionError,
  ValidationError,
  createSafeHandler,
  withErrorHandling,
} from "@/lib/utils/errorHandler";

describe("Error Handler Extended Edge Cases", () => {
  describe("getFirebaseErrorMessage", () => {
    it("should handle Firebase permission-denied code", () => {
      const error = new Error("Missing or insufficient permissions");
      expect(getFirebaseErrorMessage(error)).toContain("permission");
    });

    it("should handle Firebase not-found error", () => {
      const error = new Error("Document does not exist");
      expect(getFirebaseErrorMessage(error)).toContain("not found");
    });

    it("should handle Firebase unavailable error", () => {
      const error = new Error("Service unavailable");
      expect(getFirebaseErrorMessage(error)).toContain("unavailable");
    });

    it("should handle Firebase quota-exceeded error", () => {
      const error = new Error("Quota exceeded");
      expect(getFirebaseErrorMessage(error)).toContain("limit");
    });

    it("should handle Firebase invalid-argument error", () => {
      const error = new Error("invalid-argument: Invalid data");
      expect(getFirebaseErrorMessage(error)).toContain("Invalid input");
    });

    it("should handle Firebase already-exists error", () => {
      const error = new Error("already-exists");
      expect(getFirebaseErrorMessage(error)).toContain("already exists");
    });

    it("should handle Firebase auth errors", () => {
      const error = new Error("auth/user-not-found");
      expect(getFirebaseErrorMessage(error)).toContain("Authentication");
    });

    it("should handle generic Error with empty message", () => {
      const error = new Error("");
      const message = getFirebaseErrorMessage(error);
      expect(message).toBeTruthy();
    });

    it("should handle Error with only whitespace message", () => {
      const error = new Error("   ");
      const message = getFirebaseErrorMessage(error);
      expect(message).toBeTruthy();
    });

    it("should handle undefined error", () => {
      const message = getFirebaseErrorMessage(undefined);
      expect(message).toBe("An unexpected error occurred. Please try again.");
    });

    it("should handle number error", () => {
      const message = getFirebaseErrorMessage(404);
      expect(message).toBe("An unexpected error occurred. Please try again.");
    });

    it("should handle object error", () => {
      const message = getFirebaseErrorMessage({ code: "test", message: "test" });
      expect(message).toBe("An unexpected error occurred. Please try again.");
    });
  });

  describe("createSafeHandler", () => {
    it("should catch errors and call onError callback", async () => {
      const onError = jest.fn();
      const failingFn = jest.fn().mockRejectedValue(new Error("Test error"));
      
      const safeHandler = createSafeHandler(failingFn, onError);
      await safeHandler("arg1", "arg2");

      expect(failingFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should not call onError when function succeeds", async () => {
      const onError = jest.fn();
      const successFn = jest.fn().mockResolvedValue("success");
      
      const safeHandler = createSafeHandler(successFn, onError);
      await safeHandler();

      expect(successFn).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("should handle non-Error exceptions", async () => {
      const onError = jest.fn();
      const failingFn = jest.fn().mockRejectedValue("String error");
      
      const safeHandler = createSafeHandler(failingFn, onError);
      await safeHandler();

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("withErrorHandling", () => {
    it("should wrap function and translate errors", async () => {
      const failingFn = jest.fn().mockRejectedValue(new PermissionError("No access"));
      
      const wrappedFn = withErrorHandling(failingFn);
      
      await expect(wrappedFn()).rejects.toThrow();
    });

    it("should use custom error message when provided", async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error("Technical error"));
      
      const wrappedFn = withErrorHandling(failingFn, "Custom error message");
      
      await expect(wrappedFn()).rejects.toThrow("Custom error message");
    });

    it("should preserve function arguments", async () => {
      const testFn = jest.fn().mockResolvedValue("result");
      
      const wrappedFn = withErrorHandling(testFn);
      await wrappedFn("arg1", "arg2", "arg3");

      expect(testFn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
    });

    it("should preserve return value on success", async () => {
      const testFn = jest.fn().mockResolvedValue("success");
      
      const wrappedFn = withErrorHandling(testFn);
      const result = await wrappedFn();

      expect(result).toBe("success");
    });
  });

  describe("Error class inheritance", () => {
    it("should have correct error names", () => {
      const firebaseError = new FirebaseError("code", "message");
      const permissionError = new PermissionError();
      const validationError = new ValidationError("Invalid");

      expect(firebaseError.name).toBe("FirebaseError");
      expect(permissionError.name).toBe("PermissionError");
      expect(validationError.name).toBe("ValidationError");
    });

    it("should be instanceof Error", () => {
      const firebaseError = new FirebaseError("code", "message");
      const permissionError = new PermissionError();
      const validationError = new ValidationError("Invalid");

      expect(firebaseError).toBeInstanceOf(Error);
      expect(permissionError).toBeInstanceOf(Error);
      expect(validationError).toBeInstanceOf(Error);
    });
  });
});
