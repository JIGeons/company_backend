/**
 * User Controller
 */
import { Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { HttpException } from "@exceptions/httpException";
import fs from "fs";
import ejs from "ejs";
import jwt from "jsonwebtoken";

// ENV
import { NODE_ENV, ACCESS_SECRET, JWT_EXPIRES, CLIENT_URI } from "@/config";

// Interface
import { AuthUser } from "@interfaces/user.interface";

// Service
import { UserService } from '@services/user.service';

// Dto
import { CreateUserDto } from "@/dtos/mysql/user.dto";

export class UserController {
  private userService = Container.get(UserService);

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createUserData: CreateUserDto = req.body;

      const signupResult = await this.userService.signup(createUserData);

      res.status(201).json({ success: true, data: signupResult.data, message: "회원가입이 완료되었습니다." });
    } catch (error) {
      next(error);
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, password } = req.body;
      const clientIp = req.clientIp;

      const loginResult = await this.userService.login(clientIp, userId, password);
      if (!loginResult.success) {
        return next(new HttpException(400, "Invalid username or password"));
      }

      const resultData = loginResult.data;

      res.cookie('refreshToken', resultData.refreshToken, {
        httpOnly: true,               // 클라이언트(JavaScript)에서 해당 쿠키에 접근 할 수 없도록 설정
        secure: NODE_ENV === 'prod',  // Https 연결에서만 쿠키를 전송하도록 설정 (서버가 운영환경에서만 Secure 옵션 활성화)
        sameSite: 'strict',           // 외부 사이트에서의 요청에 대해 쿠키를 전송하지 않도록 설정
        maxAge: JWT_EXPIRES * 1000        // 쿠키의 만료 시간 설정
      });

      delete resultData.user.password;  // password 제거

      res.status(200).json({ message: "로그인 성공", user: resultData.user, accessToken: resultData.accessToken });
    } catch (error) {
      next(error);
    }
  }

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as AuthUser;
      const accessToken = req.accessToken!;

      // 로그아웃 처리
      const logoutResult = await this.userService.logout(user, accessToken);
      if (!logoutResult.success) {
        return next(new HttpException(404, logoutResult.error));
      }

      // 쿠키 삭제
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // 응답 반환
      res.json({ success: true, message: "로그아웃 되었습니다." })
    } catch (error) {
      next(error);
    }
  }

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const deleteResult = await this.userService.deleteUser(Number(id));

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
    const token = req.accessToken!;

    if (!token) {
      res.status(400).json({ isValid: false, message: "토큰이 유효하지 않습니다."});
      return ;
    }

    // 토큰 유효성 확인
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      res.status(200).json({ isValid: true, user: decoded }); // 인증된 토큰을 바탕으로 user 필드를 전송
    } catch (error) {
      res.status(401).json({ isValid: false, message: "유효하지 않은 토큰입니다." });
    }
  }

  public reissueTokens = async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.user as AuthUser;
    const refreshToken = req.refreshToken!;
    const clientIp = req.clientIp;

    try {
      // 새로운 토큰 발행
      const reissueTokenResult = await this.userService.reissueAccessToken(authUser, refreshToken, clientIp);
      if (!reissueTokenResult.success) {
        return next(new HttpException(404, reissueTokenResult.error));
      }

      const tokens = reissueTokenResult.data;
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,               // 클라이언트(JavaScript)에서 해당 쿠키에 접근 할 수 없도록 설정
        secure: NODE_ENV === 'prod',  // Https 연결에서만 쿠키를 전송하도록 설정 (서버가 운영환경에서만 Secure 옵션 활성화)
        sameSite: 'strict',           // 외부 사이트에서의 요청에 대해 쿠키를 전송하지 않도록 설정
        maxAge: JWT_EXPIRES * 1000        // 쿠키의 만료 시간 설정
      });

      res.status(200).json({ message: "새로운 토큰을 발행하였습니다.", accessToken: tokens.accessToken });
    } catch (error) {
      // 에러 상태 코드가 403인 경우 쿠키 clear
      if (error instanceof HttpException && error.status === 403) {
        res.clearCookie('refreshToken');
      }
      next(error);
    }
  }

  public renderVerifyPage = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, code } = req.query;
    // param에 userId와 code가 없는 경우
    if (!(userId && code)) {
      res.status(400).send("잘못된 요청입니다.");
      return ;
    }

    // 단순 EJS 템플릿 렌더링 후 반환
    const verifyPage = fs.readFileSync('./src/templates/account-verify.template.ejs', 'utf-8');
    const renderPage = ejs.render(verifyPage, {redirectUrl: `${CLIENT_URI}`});
    res.send(renderPage);
  }

  public accountVerify = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, code } = req.query;
    const { userId: accountId, userPassword } = req.body;

    // param에 userId와 code가 없는 경우
    if (!(userId && code) || (userId !== accountId)
      || !(accountId && userPassword) || typeof code !== 'string') {
      console.error("잘못된 요청");
      res.status(400).send("잘못된 요청입니다.");
      return ;
    }

    try {
      // 사용자 정보 인증 및 재활성화
      const verifyResult = await this.userService.verifyUserAccount(accountId, userPassword, code);

      res.status(200).json({ success: true, data: verifyResult.data });
    } catch (error) {
      next(error);
    }
  }
}