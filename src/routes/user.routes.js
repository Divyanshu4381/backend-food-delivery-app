
import {Router} from 'express'
import { createDeliveryBoyForFrenchie, forgetPassword, frenchiesCreatedByAdmin, getAllFrenchies, getCurrentUser, getCurrentUserDetails, getSingleFrenchies, logout, manageFrenchiesBySuperAdmin, refereshAccessToken, registerSuperAdmin, updateDetailsFrenchie, updatePassword, userLogin } from '../controllers/user.controller.js';
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.js';
import { sendOTP, verifyOTP } from '../controllers/auth.controller.js';

const router=Router();

router.post('/register-superadmin',registerSuperAdmin)
router.post('/login',userLogin)


router.post('/super-admin/create-admin',verifyJWT,authorizeRoles("superAdmin"),frenchiesCreatedByAdmin)
router.post('/logout',verifyJWT,logout)


// for frenchies handling
router.put('/frenchies/update-details-frenchie',verifyJWT,authorizeRoles("frenchies"),upload.single('image'),updateDetailsFrenchie)
router.patch('/frenchies/forget-password',forgetPassword)
router.post('/frenchies/create-delivery-boy',verifyJWT,authorizeRoles("frenchies"),createDeliveryBoyForFrenchie)


// for super admin
router.get('/super-admin/getallfrenchies',verifyJWT,authorizeRoles("superAdmin"),getAllFrenchies)
router.get('/getsinglefrenchie',verifyJWT,authorizeRoles("superAdmin"),getSingleFrenchies)
router.put('/super-admin/manage-frenchies',verifyJWT,authorizeRoles("superAdmin"),manageFrenchiesBySuperAdmin)

// all user work api
router.post('/refereshaccesstoken',verifyJWT,refereshAccessToken)
router.get('/getcurrentuser',verifyJWT,getCurrentUser)
router.get('/getcurrentuserdetails',verifyJWT,getCurrentUserDetails)
router.patch('/update-password',verifyJWT,updatePassword)



router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);



export default router;