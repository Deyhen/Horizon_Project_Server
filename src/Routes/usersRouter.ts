import { Router } from "express";

import usersController from "../Controllers/usersController";
import { loginValidationSchema, registrationValidationSchema } from "./validationRules/usersValidationRules";


export const usersRouter = Router()



usersRouter.post('/users/login',loginValidationSchema, usersController.login)
usersRouter.post('/users/registration',registrationValidationSchema, usersController.registration)
usersRouter.post('/users/logout', usersController.logout)
usersRouter.get('/users', usersController.getUsers)
usersRouter.get('/users/user', usersController.getUser)
usersRouter.delete('/users/user', usersController.deleteUser)

