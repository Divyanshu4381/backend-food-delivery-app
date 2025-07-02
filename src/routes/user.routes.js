
import {Router} from 'express'
import { forgetPassword, frenchiesCreatedByAdmin, getAllFrenchies, getCurrentUser, getCurrentUserDetails, getSingleFrenchies, logout, manageFrenchiesBySuperAdmin, refereshAccessToken, registerSuperAdmin, updateDetailsFrenchie, userLogin } from '../controllers/user.controller.js';
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';

const router=Router();

router.post('/register-superadmin',registerSuperAdmin)
router.post('/login',userLogin)


router.post('/super-admin/create-admin',verifyJWT,authorizeRoles("superAdmin"),frenchiesCreatedByAdmin)
router.post('/logout',verifyJWT,logout)


// for frenchies handling
router.put('/frenchies/update-details-frenchie',verifyJWT,authorizeRoles("frenchies"),updateDetailsFrenchie)
router.patch('/frenchies/forget-password',forgetPassword)

// for super admin
router.get('/super-admin/getallfrenchies',verifyJWT,authorizeRoles("superAdmin"),getAllFrenchies)
router.get('/getsinglefrenchie',verifyJWT,authorizeRoles("superAdmin"),getSingleFrenchies)
router.put('/super-admin/manage-frenchies',verifyJWT,authorizeRoles("superAdmin"),manageFrenchiesBySuperAdmin)

// all user work api
router.post('/refereshaccesstoken',verifyJWT,refereshAccessToken)
router.get('/getcurrentuser',verifyJWT,getCurrentUser)
router.get('/getcurrentuserdetails',verifyJWT,getCurrentUserDetails)



export default router;