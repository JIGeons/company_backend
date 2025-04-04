import { Router } from 'express';
import { Routes } from "@interfaces/routes.interface";

// Controller
import { PostController } from "@controllers/post.controller";

// Middleware
import { AuthMiddleware } from "@middlewares/auth.middleware";

export class PostRoute implements Routes {
  public path = "/api/post";
  public router = Router();
  public postController = new PostController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /* ===== GET ===== */
    this.router.get(`${this.path}/`, this.postController.getAllPosts);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.postController.getPostById);

    /* ===== POST ===== */
    this.router.post(`${this.path}/`, AuthMiddleware, this.postController.createPost);

    /* ===== PUT ===== */
    this.router.put(`${this.path}/:id`, AuthMiddleware, this.postController.updatePost);

    /* ===== DELETE ===== */
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.postController.deletePost);
  }
}