import { Router } from 'express';
import { Routes } from "@interfaces/routes.interface";

// Controller
import { UserController } from '@controllers/user.controller';

// Middleware
import {AuthMiddleware, RefreshTokenMiddleware} from "@middlewares/auth.middleware";

export class UserRoute implements Routes {
  public path = "/api/auth";
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, this.userController.signup);
    this.router.post(`${this.path}/login`, this.userController.login);
    this.router.post(`${this.path}/logout`, AuthMiddleware, this.userController.logout);
    this.router.post(`${this.path}/verify-token`, AuthMiddleware, this.userController.verifyToken);
    this.router.post(`${this.path}/refresh-token`, RefreshTokenMiddleware, this.userController.reissueTokens);

    // 사용자 계정 재활성화 관련 API
    this.router.get(`${this.path}/verify`, this.userController.renderVerifyPage)
    this.router.post(`${this.path}/verify`, this.userController.accountVerify)

    // Delete
    this.router.delete(`${this.path}/delete/:id`, AuthMiddleware, this.userController.deleteUser);
  }
}