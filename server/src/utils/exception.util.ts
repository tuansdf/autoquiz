import { ZodError } from "zod";
import { CustomException } from "../custom-exception";

class ExceptionUtils {
  public toResponse(err: unknown): { message: string; status: number } {
    let errorMessage = "Something Went Wrong";
    let status = 500;
    if (err instanceof CustomException) {
      status = err.status || 400;
      if (err.message) errorMessage = err.message;
    }
    if (err instanceof ZodError) {
      status = 400;
      errorMessage = err.issues
        .map((issue) => (issue.path?.[0] ? String(issue.path[0]) + ": " : "") + issue.message)
        .join("\n");
    }
    return { message: errorMessage, status };
  }
}

export const exceptionUtils = new ExceptionUtils();
