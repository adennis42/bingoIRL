import {
  getFirebaseErrorMessage,
  logError,
  FirebaseError,
  PermissionError,
  ValidationError,
} from "@/lib/utils/errorHandler";

describe("Error Handler Edge Cases", () => {
  describe("getFirebaseErrorMessage", () => {
    it("should handle network errors", () => {
      const error = new Error("Network request failed");
      expect(getFirebaseErrorMessage(error)).toContain("Network");
    });

    it("should handle not-found errors", () => {
      const error = new Error("Document not found");
      expect(getFirebaseErrorMessage(error)).toContain("not found");
    });

    it("should handle unavailable errors", () => {
      const error = new Error("Service unavailable");
      expect(getFirebaseErrorMessage(error)).toContain("unavailable");
    });

    it("should handle quota errors", () => {
      const error = new Error("Quota exceeded");
      const message = getFirebaseErrorMessage(error);
      // Should contain either "limit" or "quota" in the response
      expect(message).toMatch(/limit|quota/i);
    });

    it("should handle invalid-argument errors", () => {
      const error = new Error("invalid-argument");
      expect(getFirebaseErrorMessage(error)).toContain("Invalid input");
    });

    it("should handle already-exists errors", () => {
      const error = new Error("already-exists");
      expect(getFirebaseErrorMessage(error)).toContain("already exists");
    });

    it("should handle auth errors", () => {
      const error = new Error("auth/error");
      expect(getFirebaseErrorMessage(error)).toContain("Authentication");
    });

    it("should handle ValidationError", () => {
      const error = new ValidationError("Invalid input");
      expect(getFirebaseErrorMessage(error)).toBe("Invalid input");
    });

    it("should handle FirebaseError with userMessage", () => {
      const error = new FirebaseError("code", "Technical message");
      error.userMessage = "User-friendly message";
      expect(getFirebaseErrorMessage(error)).toBe("User-friendly message");
    });

    it("should handle FirebaseError without userMessage", () => {
      const error = new FirebaseError("code", "Technical message");
      expect(getFirebaseErrorMessage(error)).toBe("Technical message");
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

    it("should log Error objects with stack", () => {
      const error = new Error("Test error");
      error.stack = "Error stack trace";
      logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const errorInfo = consoleSpy.mock.calls[0][1];
      expect(errorInfo.error.stack).toBe("Error stack trace");
    });

    it("should log non-Error objects", () => {
      logError("String error");
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("should include timestamp", () => {
      logError(new Error("Test"));
      const errorInfo = consoleSpy.mock.calls[0][1];
      expect(errorInfo.timestamp).toBeDefined();
      expect(new Date(errorInfo.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should include context when provided", () => {
      logError(new Error("Test"), { userId: "123", action: "test" });
      const errorInfo = consoleSpy.mock.calls[0][1];
      expect(errorInfo.context).toEqual({ userId: "123", action: "test" });
    });

    it("should handle null context", () => {
      logError(new Error("Test"), undefined);
      const errorInfo = consoleSpy.mock.calls[0][1];
      expect(errorInfo.context).toBeUndefined();
    });
  });
});
