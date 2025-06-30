
import {Router} from 'express'
import { forgetPassword, frenchiesCreatedByAdmin, getAllFrenchies, logout, manageFrenchiesBySuperAdmin, registerSuperAdmin, updateDetailsFrenchie, userLogin } from '../controllers/user.controller.js';
import  { authorizeRoles, verifyJWT } from '../middlewares/auth.middleware.js';

const router=Router();

router.post('/register-superadmin',registerSuperAdmin)
router.post('/login',userLogin)


router.post('/super-admin/create-admin',verifyJWT,authorizeRoles("superAdmin"),frenchiesCreatedByAdmin)
router.post('/logout',verifyJWT,logout)


// for frenchies handling
router.put('/frenchies/update-details-frenchie',verifyJWT,authorizeRoles("frenchies"),updateDetailsFrenchie)
router.patch('/frenchies/forget-password',verifyJWT,authorizeRoles("frenchies"),forgetPassword)

// for super admin
router.get('/super-admin/getallfrenchies',verifyJWT,authorizeRoles("superAdmin"),getAllFrenchies)
router.get('/super-admin/getallfrenchies',verifyJWT,authorizeRoles("superAdmin"),manageFrenchiesBySuperAdmin)




export default router;