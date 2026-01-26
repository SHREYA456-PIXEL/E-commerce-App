/*import express from "express";
const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
export default router;*/

import express from "express";
import {
  deleteProduct,
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET all products
router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.put("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
