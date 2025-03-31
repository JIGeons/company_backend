export class HttpException extends Error {
  public status: number;
  public success: boolean;
  public message: string;
  public error?: any;

  constructor(status: number, message: string, error?: any) {
    super(message);
    this.status = status;
    this.success = false;
    this.message = message;
    this.error = error;
  }
}