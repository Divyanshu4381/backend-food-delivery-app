
import {Router} from 'express'
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';
import { createProduct, getAllProducts, updateProduct } from '../controllers/product.controller.js';

const router=Router();


router.post('/create-product',verifyJWT,authorizeRoles("frenchies"),createProduct)
router.post('/getallproduct',verifyJWT,authorizeRoles("frenchies"),getAllProducts)

router.post('/updateproduct',verifyJWT,authorizeRoles("frenchies"),updateProduct)

export default router;