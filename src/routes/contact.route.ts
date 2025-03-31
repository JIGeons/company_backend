import { Router } from 'express';
import { Routes } from "@interfaces/routes.interface";

// Controller
import { ContactController } from "@controllers/contact.controller";

// Middleware
import { AuthMiddleware } from "@middlewares/auth.middleware";

export class ContactRoute implements Routes {
  public path = "/api/contact";
  public router = Router();
  public contactController = new ContactController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /* ===== GET ===== */
    this.router.get(`${this.path}`, AuthMiddleware, this.contactController.getAllContact);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.contactController.getContactById);

    /* ===== POST ===== */
    this.router.post(`${this.path}`, this.contactController.addContact);

    /* ===== PUT ===== */
    this.router.put(`${this.path}/:id`, AuthMiddleware, this.contactController.updateContact);

    /* ===== DELETE ===== */
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.contactController.deleteContact);
  }
}