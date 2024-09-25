import { NextFunction, Request, Response } from "express"
import userService from "../Services/users.service";
import * as dotenv from "dotenv"
import { matchedData, validationResult } from "express-validator";
import { ApiError } from "../exceptions/api.error";

dotenv.config()

class UsersController{
    async getUsers (req: Request, res: Response){
        const users = await userService.getUsers()
        
        return res.status(200).json(users)
    }
    async getUser(req: Request, res: Response){
        
        const foundUser = await userService.findUser(req.body.user)

        return res.status(200).json(foundUser)
    }
    async registration (req: Request, res: Response, next: NextFunction){
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                next(ApiError.BadRequest('Error in validation', errors.array()));
            } 
            const data = matchedData(req)

            const {username, email, password} = data;
            const userData = await userService.registration(email, username, password)

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 *60 * 60 *  1000, httpOnly: true, path: `${process.env.BACKEND_URL}/api/refresh`})
            
            return res.status(200).json(userData)
        } catch (error) {
            next(error)

        }
    }
    async login (req: Request, res:Response, next: NextFunction){
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                next(ApiError.BadRequest('Error in validation', errors.array()));
            } 
            const data = matchedData(req);

            const userData = await userService.login(data.username, data.password)

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 *60 * 60 *  1000, httpOnly: true})
            
            return res.status(200).json(userData)
        } catch (error) {
            next(error)
        }
    }
    async logout(req: Request, res: Response, next: NextFunction){
        try {
            const {refreshToken} = req.cookies

            await userService.logout(refreshToken)
            res.clearCookie('refreshToken')

            res.status(200)
        } catch (error) {
            next(error)
        }
    }
    async activate (req: Request, res: Response, next: NextFunction){
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink);

            return res.redirect(process.env.FRONTEND_URL || 'localhost://3000')
        } catch (error) {
            next(error)
        }
    }
    async refresh(req:Request, res:Response, next: NextFunction){
        try {
            const {refreshToken} = req.cookies

            const userData = await userService.refresh(refreshToken)

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 *60 * 60 *  1000, httpOnly: true})
            
            return res.status(200).json(userData)
        } catch (error) {
            next(error)
        }
    }
}

export default new UsersController()