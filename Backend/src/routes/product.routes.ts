import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";

const router = Router();

// /api/products
router.route("/").get(ProductController.getProducts).post(ProductController.createProduct);

// /api/products/:id
router
    .route("/:id")
    .get(ProductController.getProductById)
    .put(ProductController.updateProduct)
    .delete(ProductController.deleteProduct);

export default router;
