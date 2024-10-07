import { NextFunction, Request, Response } from "express"
import userService from "../Services/users.service";
import * as dotenv from "dotenv"
import { matchedData, validationResult } from "express-validator";
import { ApiError } from "../exceptions/api.error";
import userResponseDataDto from "../dto/userResponse.dto";

dotenv.config()

class UsersController{
    async getUsers (req: Request, res: Response){
        const users = await userService.getUsers()
        
        res.status(200).json(users)
    }
    async getUser(req: Request, res: Response){
        
        const foundUser = await userService.findUser(req.body.user)

        res.status(200).json(foundUser)
    }
    async registration (req: Request, res: Response, next: NextFunction){
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                next(ApiError.BadRequest('Error in validation', errors.array()));
            } 
            const data = matchedData(req)

            const {username, email, password} = data;
            const userData = await userService.registration(email, password, username)

            res.cookie('refreshToken', userData.tokens.refreshToken, {maxAge: 30 * 24 *60 * 60 *  1000, httpOnly: true, path: `${process.env.BACKEND_URL}/api/refresh`})

            res.status(200).json({accessToken: userData.tokens.accessToken, user: userData.createdUser})
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

            res.cookie('refreshToken', userData.tokens.refreshToken, {maxAge: 30 * 24 *60 * 60 *  1000, httpOnly: true, path: `${process.env.BACKEND_URL}/api/refresh`})
            
            res.status(200).json({accessToken: userData.tokens.accessToken, user: userData.user})
        } catch (error) {
            next(error) 
        }
    }
    async logout(req: Request, res: Response, next: NextFunction){
        try {
            const {refreshToken} = req.cookies
            await userService.logout(refreshToken)
            res.clearCookie('refreshToken', {httpOnly: true, path: `${process.env.BACKEND_URL}/api/refresh`})
            res.status(200).json('Logout is success').end()
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
    async activate (req: Request, res: Response, next: NextFunction){
        try {
            const activationLink = req.params.link

            await userService.activate(activationLink);
            
            res.redirect(process.env.FRONTEND_URL || '')
        } catch (error) {
            next(error)
        }
    }
    async refresh(req:Request, res:Response, next: NextFunction){
        try {
            const {refreshToken} = req.cookies

            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.tokens.refreshToken, {maxAge: 30 * 24 *60 * 60 *  1000, httpOnly: true, path: `${process.env.BACKEND_URL}/api/refresh`})
            
            res.status(200).json({accessToken: userData.tokens.accessToken, user: userData.user})
        } catch (error) {
            next(error)
        } 
    }
    async forgotPassword (req:Request, res:Response, next: NextFunction){    
        try {
            const { email } = req.body;
            
            await userService.forgotPassword(email)

            res.status(200)
        } catch (error) {
            next(error)
        }  
    }
    async resetPassword (req:Request, res:Response, next: NextFunction){
        try {
            const { token, password } = req.body;

            const username = await userService.resetPassword(token, password)
            const userData = await userService.login(username, password)

            res.cookie('refreshToken', userData.tokens.refreshToken, {maxAge: 30 * 24 *60 * 60 *  1000, httpOnly: true, path: `${process.env.BACKEND_URL}/api/refresh`})
            
            res.status(200).json({accessToken: userData.tokens.accessToken, user: userData.user})
        } catch (error) {
            next(error)
        }
        }
        async checkResetToken (req:Request, res:Response, next: NextFunction){
            try {
                const token = req.params.token;
    
                const checkedToken = await userService.chekResetToken(token)

                res.status(200).json(checkedToken)
            } catch (error) {
                next(error)
            }
        }
        async changeSkin(req:Request, res:Response, next: NextFunction){
            try {
                const {id} = req.body

                if (!req.file) {
                    return res.status(400).json({ success: false, message: 'Invalid data' });
                  }
                const skinPath = `/skins/${req.file.filename}`; 

                const updatedUser = await userService.changeSkin( skinPath, id)

                res.status(200).json(updatedUser);
            } catch (error) {
                next(error)
            }
        }
        async changeAvatar(req:Request, res:Response, next: NextFunction){
            try {
                const {id} = req.body

                if (!req.file) {
                    return res.status(400).json({ success: false, message: 'Invalid data' });
                  }
                const avatarPath = `/avatars/${req.file.filename}`; 
                
                const updatedUser = await userService.changeAvatar( avatarPath, id)

                res.status(200).json(updatedUser);
            } catch (error) {
                next(error)
            }
        }
}

export default new UsersController()