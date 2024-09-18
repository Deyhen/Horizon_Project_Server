import { Router } from "express";

import usersController from "../Controllers/usersController";


export const usersRouter = Router()



usersRouter.post('/users/login', usersController.login)
usersRouter.post('/users/registration', usersController.registration)
usersRouter.post('/users/logout', usersController.logout)
usersRouter.get('/users', usersController.getUsers)
usersRouter.get('/users/user', usersController.getUser)

