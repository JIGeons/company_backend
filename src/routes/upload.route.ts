import { Router } from 'express';
import { Routes } from "@interfaces/routes.interface";
import multer from "multer";

// Controller
import { UploadController } from "@controllers/upload.controller";

// Middleware
import { AuthMiddleware } from "@middlewares/auth.middleware";

export class UploadRoute implements Routes {
  public path = "/api/upload";
  public router = Router();
  public uploadController = new UploadController();

  constructor() {
    this.initializeRoutes();
  }

  // 이미지 최대 용량을 설정
  private imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
    }
  });

  // 파일 최대 용량을 설정
  private fileUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024,
    }
  });

  private initializeRoutes() {
    this.router.post(`${this.path}/image`, AuthMiddleware, this.imageUpload.single("image"), this.uploadController.uploadImages);
    this.router.post(`${this.path}/file`, AuthMiddleware, this.fileUpload.single("file"), this.uploadController.uploadFiles);
  }
}