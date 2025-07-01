
import {Router} from 'express'
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';
import { createProduct } from '../controllers/product.controller.js';

const router=Router();

router.post('/create-product',verifyJWT,authorizeRoles("frenchies"),createProduct)


export default router;