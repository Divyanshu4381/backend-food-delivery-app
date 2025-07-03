import Router from "express"
import {  placeOrder } from "../controllers/order.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()

router.post('/place-order',verifyJWT,authorizeRoles("customer"),placeOrder)

export default router;