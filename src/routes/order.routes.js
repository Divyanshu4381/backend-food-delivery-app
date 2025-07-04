import Router from "express"
import {  cancelOrderByCustomer, fetchOrderByCustomer, fetchOrderByFrenchies, fetchOrderBySuperAdmin, manageOrderByFrenchies, placeOrder } from "../controllers/order.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()


// CUSTOMER ROUTES
router.post('/place-order',verifyJWT,authorizeRoles("customer"),placeOrder)
router.get('/customer-orders',verifyJWT,authorizeRoles("customer"),fetchOrderByCustomer)
router.patch('/cancel-orders',verifyJWT,authorizeRoles("customer"),cancelOrderByCustomer)


// FRENCHIES ROUTES
router.get('/fetch-order-by-frenchies',verifyJWT,authorizeRoles("frenchies"),fetchOrderByFrenchies)
router.get('/manage-order-by-frenchies',verifyJWT,authorizeRoles("frenchies"),manageOrderByFrenchies)



// SUPER-ADMIN ROUTES
router.get('/get-order-by-superAdmin/:id',verifyJWT,authorizeRoles("superAdmin"),fetchOrderBySuperAdmin)

export default router;