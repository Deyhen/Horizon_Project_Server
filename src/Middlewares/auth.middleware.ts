import {ApiError} from '../exceptions/api.error'
import { NextFunction, Request, Response } from "express"
import tokensService from '../Services/tokens.service'

export default async function ( req: Request, res: Response, next: NextFunction){
    try {
        const authorizationHeader = req.headers.authorization
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(" ")[1]
        if(!accessToken){
            return next(ApiError.UnauthorizedError())
        }

        const userData = await tokensService.validateAccessToken(accessToken)
        if(!userData){
            return next(ApiError.UnauthorizedError())
        }
        req.body.user = userData
        next();
    } catch (error) {
       return next(ApiError.UnauthorizedError())
    }
}