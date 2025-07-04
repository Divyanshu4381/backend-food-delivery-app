import Router from "express"
import {  fetchOrderByCustomer, fetchOrderByFrenchies, placeOrder } from "../controllers/order.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()


// CUSTOMER ROUTES
router.post('/place-order',verifyJWT,authorizeRoles("customer"),placeOrder)
router.get('/customer-orders',verifyJWT,authorizeRoles("customer"),fetchOrderByCustomer)


// FRENCHIES ROUTES
router.get('/fetch-order-by-frenchies',verifyJWT,authorizeRoles("frenchies"),fetchOrderByFrenchies)

export default router;