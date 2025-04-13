/**
 * User Controller
 */
import { Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { HttpException } from "@exceptions/httpException";
import jwt from "jsonwebtoken";

// ENV
import { NODE_ENV, JWT_SECRET, EXPIRES } from "@/config";

// Interface
import { AuthUser } from "@interfaces/user.interface";

// Service
import { UserService } from '@services/user.service';

export class UserController {
  private userService = Container.get(UserService);

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      const signupResult = await this.userService.signup(username, password);

      res.status(201).json({ success: true, data: signupResult.data, message: "회원가입이 완료되었습니다." });
    } catch (error) {
      next(error);
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      const loginResult = await this.userService.login(username, password);
      if (!loginResult.success) {
        return next(new HttpException(400, "Invalid username or password"));
      }

      const resultData = loginResult.data;

      res.cookie('token', resultData.token, {
        httpOnly: true,               // 클라이언트(JavaScript)에서 해당 쿠키에 접근 할 수 없도록 설정
        secure: NODE_ENV === 'prod',         // Https 연결에서만 쿠키를 전송하도록 설정 (서버가 운영환경에서만 Secure 옵션 활성화)
        sameSite: 'strict',           // 외부 사이트에서의 요청에 대해 쿠키를 전송하지 않도록 설정
        maxAge: EXPIRES * 1000   // 쿠키의 만료 시간 설정
      });

      const userWithoutPassword = resultData.user.toObject();  // mongoDB 객체를 일반 객체로 변환
      delete userWithoutPassword.password;  // password 제거

      res.status(200).json({ message: "로그인 성공", user : userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as AuthUser;

      // 쿠키 초기화
      res.clearCookie('token', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
      });

      const logoutResult = await this.userService.logout(user);
      // 로그아웃 실패 시
      if (!logoutResult.success) {
        return next(new HttpException(404, logoutResult.error));
      }

      // 로그아웃 성공 시
      res.json({ success: true, message: "로그아웃 되었습니다." })
    } catch (error) {
      next(error);
    }
  }

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const deleteResult = await this.userService.deleteUser(userId);

      // 삭제 실패 시
      if (!deleteResult.success) {
        return next(new HttpException(404, deleteResult.error));
      }

      res.status(200).json({ success: true, message: "사용자가 성공적으로 삭제되었습니다." });
    } catch (error) {
      next(error);
    }
  }

  public verifyToken = async (req: Request, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).json({ isValid: false, message: "토큰이 유효하지 않습니다."});
      return ;
    }

    // 토큰 유효성 확인
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.status(200).json({ isValid: true, user: decoded }); // 인증된 토큰을 바탕으로 user 필드를 전송
    } catch (error) {
      res.status(401).json({ isValid: false, message: "유효하지 않은 토큰입니다." });
    }
  }
}