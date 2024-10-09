import { NextFunction, Request, Response } from "express"
import { ApiError } from "../exceptions/api.error"
import promocodesService from "../Services/promocodes.service"

class PromocodesController {
    async activatePromocode(req: Request, res: Response, next: NextFunction) {
        try {
          const token = req.headers.authorization?.split(' ')[1]
          const { promocode } = req.params
    
          if (!token) {
            throw ApiError.UnauthorizedError()
          } else if (!promocode) {
            throw ApiError.BadRequest('Invalid promocode')
          }
    
          await promocodesService.activatePromocode(promocode, token)
    
          res.status(200).json({ message: 'Success' })
        } catch (error) {
          next(error)
        }
      }
    async addNewPromocodes (req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body.user.role !== 'admin') {
                throw ApiError.UnauthorizedError()
              } else if (!req.body.payload) {
                throw ApiError.BadRequest('Invalid request')
              }
              
            const { name, gameCurrencyBonus, donateCurrencyBonus, amount } = req.body.payload
      
            await promocodesService.addNewPromocodes(name, gameCurrencyBonus, donateCurrencyBonus, amount)
      
            res.status(200).json({ message: 'Success' })
          } catch (error) {
            next(error)
          }
    }
}

export default new PromocodesController()