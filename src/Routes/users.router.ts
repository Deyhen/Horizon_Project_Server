import { Router } from "express";
import usersController from "../Controllers/users.controller";
import { loginValidationSchema, registrationValidationSchema } from "../Middlewares/validationRules/usersValidation.middleware";
import authMiddleware from "../Middlewares/auth.middleware"


export const usersRouter = Router()



usersRouter.post('/login', loginValidationSchema,usersController.login)
usersRouter.post('/registration',registrationValidationSchema, usersController.registration)
usersRouter.post('/logout', usersController.logout)
usersRouter.get('/users', usersController.getUsers)
usersRouter.get('/users/user', authMiddleware, usersController.getUser)
usersRouter.get('/activate/:link', usersController.activate)
usersRouter.get('/refresh', usersController.refresh)
// usersRouter.delete('/users/user/delete', usersController.deleteUser)
  