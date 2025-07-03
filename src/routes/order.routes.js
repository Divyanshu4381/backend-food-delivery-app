import Router from "express"
import {  fetchOrderByFrenchies, placeOrder } from "../controllers/order.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()

router.post('/place-order',verifyJWT,authorizeRoles("customer"),placeOrder)
router.get('/fetch-order-by-frenchies',verifyJWT,authorizeRoles("frenchies"),fetchOrderByFrenchies)

export default router;