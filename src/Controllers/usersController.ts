import { Request, Response } from "express";
import usersService from "../Services/usersService";
import { matchedData, validationResult } from "express-validator";

class UsersController {
    async getUsers (req: Request, res: Response){
        const users = await usersService.getUsers()
        
        return res.status(200).json(users)
    }
    async getUser(req: Request, res: Response){
        if(!req.headers.authorization){
            return res.status(400).json({message: "token is not given"})
        }
        const token = req.headers.authorization.split(' ')[1];

        const findedUser = await usersService.findUserByToken(token)

        return res.status(200).json(findedUser)
    }
    async login(req: Request, res: Response){
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } 
        const data = matchedData(req)
        const {username, password} = data
        const token = await usersService.login(username, password)
            
        return res.status(200).json(token)

    }
    async logout(req: Request, res: Response){
        if(!req.headers.authorization){
            return res.status(400).json({message: "token is not given"})
        }
        const token = req.headers.authorization.split(' ')[1];

         await usersService.logOut(token)
        
        return res.status(200).json({message: 'succes'})
    }
    async registration(req: Request, res: Response){
        const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            } 
            const data = matchedData(req)

            const newUser = await usersService.createUser(data)
             return res.status(200).json(newUser)
    }
    async deleteUser(req: Request, res: Response){
        if(!req.headers.authorization){
            return res.status(400).json({message: "token is not given"})
        }
        const token = req.headers.authorization.split(' ')[1];

        const deletedUser = await usersService.deleteUser(token)

        return res.status(200).json(deletedUser)
    }
}

export default new UsersController()