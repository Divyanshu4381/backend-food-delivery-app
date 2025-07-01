import {Router} from 'express'
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from '../controllers/category.controller.js';
import { upload } from '../middlewares/multer.js';
const router=Router();

router.post("/create-category",verifyJWT,authorizeRoles("frenchies"),upload.single('image'),createCategory)
router.get("/getallcategory",verifyJWT,authorizeRoles("frenchies"),getAllCategories)
router.get("/getcategorybyid/:id",verifyJWT,authorizeRoles("frenchies"),getCategoryById)
router.put("/updatecategory/:id",verifyJWT,authorizeRoles("frenchies"),updateCategory)
router.delete("/deletecategory/:id",verifyJWT,authorizeRoles("frenchies"),deleteCategory)

export default router;