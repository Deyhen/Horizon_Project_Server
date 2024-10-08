import { Router } from "express";
import usersController from "../Controllers/users.controller";
import authMiddleware from "../Middlewares/auth.middleware"
import { uploadAvatars, uploadCapes, uploadSkins } from "../Middlewares/multer.middleware";
import { changePasswordValidationSchema, changeUsernameValidationSchema } from "../Middlewares/validationRules/usersValidation.middleware";



export const usersRouter = Router()




usersRouter.post('/forgot-password', usersController.forgotPassword)
usersRouter.post('/reset-password', usersController.resetPassword)
usersRouter.put('/change-skin',authMiddleware,uploadSkins.single('skin'), usersController.changeSkin)
usersRouter.put('/change-avatar',authMiddleware,uploadAvatars.single('avatar'), usersController.changeAvatar)
usersRouter.put('/change-cape',authMiddleware,uploadCapes.single('cape'), usersController.changeCape)
usersRouter.put('/change-username',authMiddleware,changeUsernameValidationSchema, usersController.changeUsername)
usersRouter.put('/change-password',authMiddleware,changePasswordValidationSchema, usersController.changePassword)
usersRouter.get('/reset-password/chek/:token', usersController.checkResetToken)
usersRouter.get('/users', usersController.getUsers)
usersRouter.get('/users/user', authMiddleware, usersController.getUser)
usersRouter.get('/activate/:link', usersController.activate)
usersRouter.get('/activate-email',authMiddleware, usersController.activateEmail)
usersRouter.get('/activate-promocode/:promocode',authMiddleware, usersController.activatePromocode)
  