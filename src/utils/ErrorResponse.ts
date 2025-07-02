class ErrorResponse extends Error {
  public statusCode: number;
  public errors: unknown[];
  public data: null;
  public success: false;

  constructor(
    statusCode: number,
    message = "Something Went Wrong",
    errors: undefined[] = [],
    stack = ""
  ) {
    super();

    this.statusCode = statusCode;
    this.errors = errors;
    this.message = message
    this.data = null;
    this.success = false;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ErrorResponse };
