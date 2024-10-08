import { Router } from 'express'
import usersController from '../Controllers/users.controller'
import {
  loginValidationSchema,
  registrationValidationSchema,
} from '../Middlewares/validationRules/usersValidation.middleware'
import authMiddleware from '../Middlewares/auth.middleware'
import {
  uploadAvatars,
  uploadCapes,
  uploadSkins,
} from '../Middlewares/multer.middleware'

export const usersRouter = Router()

usersRouter.post('/login', loginValidationSchema, usersController.login)
usersRouter.post(
  '/registration',
  registrationValidationSchema,
  usersController.registration
)
usersRouter.post('/logout', usersController.logout)
usersRouter.post('/forgot-password', usersController.forgotPassword)
usersRouter.post('/reset-password', usersController.resetPassword)
usersRouter.put(
  '/change-skin',
  uploadSkins.single('skin'),
  usersController.changeSkin
)
usersRouter.put(
  '/change-avatar',
  uploadAvatars.single('avatar'),
  usersController.changeAvatar
)
usersRouter.put(
  '/change-cape',
  uploadCapes.single('cape'),
  usersController.changeCape
)
usersRouter.get('/reset-password/chek/:token', usersController.checkResetToken)
usersRouter.get('/users', usersController.getUsers)
usersRouter.get('/users/user', authMiddleware, usersController.getUser)
usersRouter.get('/activate/:link', usersController.activate)
usersRouter.get('/refresh', usersController.refresh)
usersRouter.get('/activate-email', usersController.activateEmail)
usersRouter.get(
  '/activate-promocode/:promocode',
  usersController.activatePromocode
)
