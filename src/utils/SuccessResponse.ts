class SuccessResponse<T = unknown> {
  public statusCode: number;
  public message: string;
  public success: boolean;
  public data: T;
  constructor(statusCode: number, data: T, message: string = 'Success') {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = true;
  }
}

export { SuccessResponse };
