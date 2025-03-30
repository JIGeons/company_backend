export class HttpException extends Error {
  public status: number;
  public success: boolean;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.success = false;
    this.message = message;
  }
}