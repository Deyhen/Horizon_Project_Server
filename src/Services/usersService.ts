import jwt, { JwtPayload } from "jsonwebtoken"
import bcrypt from 'bcrypt'
import { connection } from ".."
import { UserFromMysql } from "../TypesStore/user"


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
    async getUsers(){
        const users = (await connection.query('SELECT * FROM users'))[0]
        console.log(users);

        return users
    }
    async findUserByToken(token: string){
        const { id } = jwt.verify(token, TokenKey!) as JwtPayload
        const user = (await connection.query('SELECT * FROM users WHERE ID = ?', [`${id}`]))[0]
        return user
    }
    async login(username: string, password: string){
        const user = (await connection.query<UserFromMysql>('SELECT FROM users WHERE USERNAME = ?', [`${username}`]))[0]

        const result = bcrypt.compareSync(password, user.password)

        if(!result){
            throw new Error ('incorrect password')
        }
        await connection.query('SET inSession = 1 WHERE ID = ?', [`${user.id}`])

        const token = await this.generateAccesToken(user.id)

        return token
    }
    async createUser(user: Record<string, string>){
        const hashedPassword = bcrypt.hashSync(user.password, 7)
        const uuid = crypto.randomUUID();
        connection.query("INSERT INTO users (id, username, password, 2f, email) VALUES (?, ?, ?, ?, ?)" , [`${uuid}`, `${user.username}`, `${hashedPassword}`, '0', `${user.email}`]) 
        const createdUser = (await connection.query('SELECT * FROM users WHERE USERNAME = ?', [`${user.username}`]))[0];
        return createdUser
        // const token = this.generateAccesToken(createdUser.id)
        // return token
    }
    async deleteUser(token: string){
        const { id } = jwt.verify(token, TokenKey!) as JwtPayload

        const deletedUser = (await connection.query('SELECT * FROM users WHERE ID = ?', [`${id}`]))[0];


        connection.query('DELETE FROM users WHERE ID = ?', [`${id}`])


        return deletedUser
    }
    async logOut(token: string){
        const { id } = jwt.verify(token, TokenKey!) as JwtPayload
        
        await connection.query('SET inSession = 0 WHERE ID = ?', [`${id}`])
    }
}

export default new UsersService()