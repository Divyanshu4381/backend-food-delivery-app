import Router from "express"
import { createOrder } from "../controllers/order.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()

router.post('/create-order',verifyJWT,authorizeRoles("customer"),createOrder)

export default router;