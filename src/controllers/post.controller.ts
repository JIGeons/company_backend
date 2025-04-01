/**
 * Post Controller
 */

import { Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { HttpException } from "@exceptions/httpException";

// Service
import { PostService } from "@services/post.service";

export class PostController {
  // PostService 의존성 주입
  private postService  = Container.get(PostService);

  public getAllPosts = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const getPostsResult = await this.postService.findAll();

      res.status(200).json({ success: true, count: getPostsResult.data.length, data: getPostsResult.data });
    } catch (error) {
      console.log("### 게시글 전제 조회 오류: ", String(error));
      next(error);
    }
  }

  public getPostById = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const { id } = req.params;
      const ip = req.ip;
      const userAgent = req.headers["User-Agent"];
      const getPostResult = await this.postService.getPostByIdWithRender(id, {ip, userAgent});

      res.status(200).json({ success: true, data: getPostResult.data });
    } catch (error) {
      console.log("### 게시글 조회 오류: ", String(error));
      next(error);
    }
  }

  public createPost = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const { title, content, fileUrl } = req.body;

      const createPostResult = await this.postService.createPost(title, content, fileUrl);
      res.status(200).json({ success: true, data: createPostResult.data });
    } catch (error) {
      console.log("### 게시글 생성 오류: ", String(error));
      next(error);
    }
  }

  public updatePost = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const { id } = req.params;
      const { title, content, fileUrl } = req.body;

      const updatePostResult = await this.postService.updatePost(id, title, content, fileUrl);
      res.status(200).json({ success: true, data: updatePostResult.data});
    } catch (error) {
      console.log("### 게시글 수정 오류: ", String(error));
      next(error);
    }
  }

  public deletePost = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const { id } = req.params;

      const deletePostResult = await this.postService.deletePost(id);
      res.status(200).json({ success: true, data: deletePostResult.data });
    } catch (error) {
      console.log("### 게시글 삭제 오류: ", String(error));
      next(error);
    }
  }


}