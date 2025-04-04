/**
 * Upload Controller
 */
import { Request, Response, NextFunction } from 'express';
import { Container } from "typedi";

// Service
import { UploadService } from '@services/upload.service';
import {HttpException} from "@exceptions/httpException";


export class UploadController {
  private uploadService = Container.get(UploadService);

  /**
   * 이미지 업로드
   */
  public uploadImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      if (!file) {
        throw new HttpException(400, "업로드할 이미지가 없습니다.");
      }

      const uploadResult = await this.uploadService.uploadImage(file);

      res.status(200).json({ success: true, data: { imageUrl: uploadResult.data.imageUrl } });
    } catch (error) {
      console.log("이미지 업로드 중 오류 발생: ", String(error));
      next(error);
    }
  }

  /**
   * 파일 업로드
   */
  public uploadFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file } = req;
      const { originalName } = req.body;

      if (!file || !originalName) {
        return next(new HttpException(400, "업로드할 파일이 없습니다."));
      }

      const uploadResult = await this.uploadService.uploadFile(file, originalName);

      res.status(200).json({ success: true, data: { imageUrl: uploadResult.data.imageUrl } });
    } catch (error) {
      console.log("파일 업로드 중 오류 발생: ", String(error));
      next(error);
    }
  }
}