import { connection } from ".."
import bcrypt from 'bcrypt'
import {v4} from 'uuid'
import mailService from "./mail.service"
import tokensService from "./tokens.service"
import { UserFromToken, UserSchema } from "../Models/user.model"
import { ApiError } from "../exceptions/api.error"
import userDto from "../dto/user.dto"
import jwt, { JwtPayload } from "jsonwebtoken"

class UsersService{
    async getUsers(){
        const users = (await connection.query<UserSchema[]>('SELECT * FROM users'))[0][0]

        return users
    }
    async findUser(user: UserFromToken){
       
        const foundUser = (await connection.query<UserSchema[]>('SELECT * FROM users WHERE ID = ?', [user.id]))[0][0]
        return foundUser
    }
    async registration (email: string, password: string, username: string){
        await this.chekUserExist({email: email, username: username})

        mailService.sendActivationMail({to: email, username: username});

        const id = v4();
        const hashedPassword = bcrypt.hashSync(password, 7);
        await connection.query("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)" , [`${id}`, `${username}`, `${hashedPassword}`, `${email}`]) ;

        const userSQL = (await connection.query<UserSchema[]>('SELECT * FROM users WHERE USERNAME = ?', [`${username}`]))[0][0]
        const createdUser = new userDto(userSQL)

        const tokens = tokensService.generateTokens({id: createdUser.id, role: createdUser.role});
        await tokensService.saveToken({userId: createdUser.id, refreshToken: tokens.refreshToken});

        return {tokens, createdUser}
    }
    async login(username: string, password: string){
        const userSQL = (await connection.query<UserSchema[]>('SELECT * from users WHERE username = ?', [username]))[0][0]; 
        if(!userSQL){
            throw ApiError.BadRequest('User is undefined');
        }
        const user = new userDto(userSQL as UserSchema)

        const isPassEqual = bcrypt.compareSync(password, user.password);
        if(!isPassEqual){
            throw ApiError.BadRequest('Incorrect password');
        }

        const tokens = tokensService.generateTokens({id: user.id, role: user.role});
        await tokensService.saveToken({userId: user.id, refreshToken: tokens.refreshToken});

        return {tokens, user}

    }
    async logout(refreshToken: string){
        tokensService.removeRefreshToken(refreshToken);

        return
    }
    async activate(activationLink: string){
        const email = (jwt.decode(activationLink) as JwtPayload).email
        
        const selectResults = (await connection.query<UserSchema[]>('SELECT * from users WHERE email = ?', [email]))[0][0];

        if(!selectResults){
            throw ApiError.BadRequest('Incorrect activation link');
        }

        connection.query('UPDATE users SET isActivated = true WHERE email = ?', [email]);
    }
    async refresh(refreshToken: string){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = await tokensService.validateRefreshToken(refreshToken);
        const tokenData = await tokensService.findRefreshToken(refreshToken);

        if(!userData || !tokenData){ 
            throw ApiError.UnauthorizedError() 
        }

        const userSQL = (await connection.query<UserSchema[]>('SELECT * from users WHERE id = ?', [userData.id]))[0][0];
        const user = new userDto(userSQL as UserSchema)
        const tokens = tokensService.generateTokens({id: user.id, role: user.role});

        await tokensService.saveToken({userId: user.id, refreshToken: tokens.refreshToken});


        return {tokens,user}
    }
    async chekUserExist ({email, username}: {email: string, username: string}) {
        const emailExist = (await connection.query<UserSchema[]>('SELECT * from users WHERE email = ?', [email]))[0][0]
        const usernameExist = (await connection.query<UserSchema[]>('SELECT * from users WHERE username = ?', [username]))[0][0]
        if(emailExist){
            throw ApiError.BadRequest('Email already exist');
        } else if(usernameExist){
            throw ApiError.BadRequest('Username already exist');
        }
        return
    }
}
export default new UsersService() 