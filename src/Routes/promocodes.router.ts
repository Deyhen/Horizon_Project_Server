import { Router } from "express"
import authMiddleware from "../Middlewares/auth.middleware"
import promocodesController from "../Controllers/promocodes.controller"


export const promocodesRouter = Router()

promocodesRouter.get('/activate-promocode/:promocode',authMiddleware, promocodesController.activatePromocode)
promocodesRouter.post('/add-promocodes',authMiddleware, promocodesController.addNewPromocodes)