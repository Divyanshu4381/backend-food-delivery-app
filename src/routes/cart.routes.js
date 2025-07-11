import express from "express";
import {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCart,
} from "../controllers/cart.controller.js";
import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add/:productId", verifyJWT,authorizeRoles("customer"), addToCart);

router.put("/update/:productId", verifyJWT,authorizeRoles("customer"), updateCartItemQuantity);

router.delete("/remove/:productId", verifyJWT,authorizeRoles("customer"), removeFromCart);

router.delete("/clear", verifyJWT,authorizeRoles("customer"), clearCart);

router.get("/", verifyJWT,authorizeRoles("customer"), getCart);

export default router;
