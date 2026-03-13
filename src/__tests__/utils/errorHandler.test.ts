import {
  getFirebaseErrorMessage,
  logError,
  FirebaseError,
  PermissionError,
  ValidationError,
} from "@/lib/utils/errorHandler";

describe("Error Handler Utilities", () => {
  describe("getFirebaseErrorMessage", () => {
    it("should handle PermissionError", () => {
      const error = new PermissionError("Custom permission error");
      expect(getFirebaseErrorMessage(error)).toBe("Custom permission error");
    });

    it("should handle FirebaseError with userMessage", () => {
      const error = new FirebaseError("permission-denied", "Technical error", null);
      error.userMessage = "User-friendly message";
      expect(getFirebaseErrorMessage(error)).toBe("User-friendly message");
    });

    it("should handle permission errors in message", () => {
      const error = new Error("Missing or insufficient permissions");
      expect(getFirebaseErrorMessage(error)).toContain("permission");
    });

    it("should handle network errors", () => {
      const error = new Error("Network request failed");
      expect(getFirebaseErrorMessage(error)).toContain("Network");
    });

    it("should handle not-found errors", () => {
      const error = new Error("Document not found");
      expect(getFirebaseErrorMessage(error)).toContain("not found");
    });

    it("should handle unknown errors", () => {
      const error = new Error("Unknown error");
      expect(getFirebaseErrorMessage(error)).toBe("Unknown error");
    });

    it("should handle non-Error objects", () => {
      expect(getFirebaseErrorMessage("String error")).toBe("An unexpected error occurred. Please try again.");
      expect(getFirebaseErrorMessage(null)).toBe("An unexpected error occurred. Please try again.");
    });
  });

  describe("FirebaseError", () => {
    it("should create FirebaseError with code and message", () => {
      const error = new FirebaseError("test-code", "Test message");
      expect(error.code).toBe("test-code");
      expect(error.message).toBe("Test message");
      expect(error.name).toBe("FirebaseError");
    });
  });

  describe("PermissionError", () => {
    it("should create PermissionError with default message", () => {
      const error = new PermissionError();
      expect(error.message).toContain("permission");
      expect(error.name).toBe("PermissionError");
    });
  });

  describe("ValidationError", () => {
    it("should create ValidationError with message", () => {
      const error = new ValidationError("Invalid input");
      expect(error.message).toBe("Invalid input");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("logError", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should log error with context", () => {
      const error = new Error("Test error");
      logError(error, { userId: "123" });

      expect(consoleSpy).toHaveBeenCalled();
      // console.error is called with "Application Error:" as first arg and object as second
      const errorInfo = consoleSpy.mock.calls[0][1];
      expect(errorInfo).toBeDefined();
      expect(errorInfo).toHaveProperty("error");
      expect(errorInfo).toHaveProperty("context");
      expect(errorInfo).toHaveProperty("timestamp");
      expect(errorInfo.context).toEqual({ userId: "123" });
    });
  });
});
