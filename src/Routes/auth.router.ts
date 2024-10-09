import { Router } from 'express'
import {
  loginValidationSchema,
  registrationValidationSchema,
} from '../Middlewares/validationRules/usersValidation.middleware'
import authController from '../Controllers/auth.controller'

export const authRouter = Router()

authRouter.post('/login', loginValidationSchema, authController.login)
authRouter.post('/registration',registrationValidationSchema,authController.registration)
authRouter.post('/logout', authController.logout)
authRouter.get('/refresh', authController.refresh)
