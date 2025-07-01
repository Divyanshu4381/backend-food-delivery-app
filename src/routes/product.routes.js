
import {Router} from 'express'
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from '../controllers/product.controller.js';

const router=Router();


router.post('/create-product',verifyJWT,authorizeRoles("frenchies"),createProduct)
router.get('/getallproduct',verifyJWT,authorizeRoles("frenchies"),getAllProducts)
router.get('/getallproduct/:id',verifyJWT,authorizeRoles("frenchies"),getProductById)

router.put('/updateproduct',verifyJWT,authorizeRoles("frenchies"),updateProduct)
router.delete('/deleteproduct',verifyJWT,authorizeRoles("frenchies"),deleteProduct)

export default router;