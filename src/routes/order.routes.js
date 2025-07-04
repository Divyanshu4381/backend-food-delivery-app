import Router from "express"
import {  fetchOrderByCustomer, fetchOrderByFrenchies, manageOrderByFrenchies, placeOrder } from "../controllers/order.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()


// CUSTOMER ROUTES
router.post('/place-order',verifyJWT,authorizeRoles("customer"),placeOrder)
router.get('/customer-orders',verifyJWT,authorizeRoles("customer"),fetchOrderByCustomer)


// FRENCHIES ROUTES
router.get('/fetch-order-by-frenchies',verifyJWT,authorizeRoles("frenchies"),fetchOrderByFrenchies)
router.get('/manage-order-by-frenchies',verifyJWT,authorizeRoles("frenchies"),manageOrderByFrenchies)



// SUPER-ADMIN ROUTES

export default router;