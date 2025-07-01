
import {Router} from 'express'
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from '../controllers/product.controller.js';
import { upload } from '../middlewares/multer.js';
const router=Router();


router.post('/create-product',verifyJWT,authorizeRoles("frenchies"),upload.single('image'),createProduct)
router.get('/getallproduct',verifyJWT,authorizeRoles("frenchies"),getAllProducts)
router.get('/getproductbyid/:id',verifyJWT,authorizeRoles("frenchies"),getProductById)

router.put('/updateproduct/:id',verifyJWT,authorizeRoles("frenchies"),upload.single('image'),updateProduct)
router.delete('/deleteproduct',verifyJWT,authorizeRoles("frenchies"),deleteProduct)

export default router;