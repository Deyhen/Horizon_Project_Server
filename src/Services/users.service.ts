import { connection } from ".."
import bcrypt from 'bcrypt'
import {v4} from 'uuid'
import mailService from "./mail.service"
import tokensService from "./tokens.service"
import { UserFromToken, UserSchema } from "../Models/user.model"
import { ApiError } from "../exceptions/api.error"
import userDto from "../dto/user.dto"
import jwt, { JwtPayload } from "jsonwebtoken"
import fs from "fs"
import { ResultSetHeader } from "mysql2"
import path from "path"

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
    async forgotPassword(email: string){
        const token = bcrypt.hashSync(email, 7);
        const expires = new Date(Date.now() + 3600000); // 1 hour

    
        const [result] = await connection.query("UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?", [token, expires, email]);
    
        if ((result as any).affectedRows === 0) {
            throw ApiError.BadRequest('Username already exist');
        }
        mailService.sendPasswordResetLink(email, token)

        return
    }
    async resetPassword(token: string, newPassword: string){
        const user = (await connection.query<UserSchema[]>("SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?", [token, new Date()]))[0][0];
        if (!user) {
            throw ApiError.BadRequest("Invalid or expired token.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 7);

        await connection.query("UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?", [hashedPassword, user.id]);

        return user.username
    }
    async chekResetToken(token: string){
        const user = (await connection.query<UserSchema[]>("SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?", [token, new Date()]))[0][0];
        if(!user){
            throw ApiError.BadRequest('Invalid reset token')
        } ;

        return user.resetPasswordToken
    }
    async changeSkin(skinPath: string, id: string){
        const oldUser = (await connection.execute<UserSchema[]>('SELECT * FROM users WHERE id = ?', [id]))[0][0]
        const filePath = path.join(process.cwd(), 'static', oldUser.skinPath);
        fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }})
        await connection.query('UPDATE users SET skinPath = ? WHERE id = ?', [skinPath, id]);
        const updatedUser = (await connection.query<UserSchema[]>('SELECT * FROM users WHERE ID = ?', [id]))[0][0]
        const user = new userDto(updatedUser as UserSchema)
        return user
        
    }
    async changeAvatar(avatarPath: string, id: string){
        const oldUser = (await connection.execute<UserSchema[]>('SELECT * FROM users WHERE id = ?', [id]))[0][0]
        const filePath = path.join(process.cwd(), 'static', oldUser.skinPath);
        fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }})
        await connection.query('UPDATE users SET avatarPath = ? WHERE id = ?', [avatarPath, id]);
        const updatedUser = (await connection.query<UserSchema[]>('SELECT * FROM users WHERE ID = ?', [id]))[0][0]
        const user = new userDto(updatedUser as UserSchema)
        return user
        
    }
}
export default new UsersService() 