import jwt, { JwtPayload } from "jsonwebtoken"
import bcrypt from 'bcrypt'
import { User } from "../TypesStore/user"

const Users: User[] = [{
    id: "1213",
    username: 'ff',
    email: 'gefw@FRFR.COM',
    password: 'fef'
}]

const TokenKey = process.env.JWT_SECRET

class UsersService{
    async generateAccesToken(id: string){
        try{
        const payload = {
            id
        }
        return jwt.sign(payload, TokenKey as string,
             {expiresIn: "24h"})
        } catch(e){
            console.log(e);
            throw new Error("error in token generating")
        }
    }
    
    async checkUserPasswordAndUsername(password: string, email: string){
        const user = Users.find((user: User) => user.email == email )
        if(!user){  
            
            throw new Error('username is not found')
        }
        const result = bcrypt.compareSync(password, user.password)
        if(!result){

            throw new Error('incorrect password')
        }
        return user
    }
    async findUserByToken(token: string){
        const { id } = jwt.verify(token, TokenKey!) as JwtPayload
        return Users.find((user: User) => user.id == id )
    }
    async login(username: string, password: string){
        const user = await this.checkUserPasswordAndUsername(password, username)
        const token = await this.generateAccesToken( user.id)
        return token
    }
    async createUser(user: Record<string, string>){
        const hashedPassword = bcrypt.hashSync(user.password, 7)
        const uuid = crypto.randomUUID();
        const targetIndex = Users.push({
            username: user.username,
            email: user.email,
            id: uuid,
            password: hashedPassword
        })
        const token = this.generateAccesToken(Users[targetIndex - 1].id)
        return token
    }
}

export default new UsersService()