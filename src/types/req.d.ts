import { AuthUser } from '@interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      clientIp?: string;
      accessToken?: string;
      refreshToken?: string;
    }
  }
}