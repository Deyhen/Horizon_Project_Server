import { connection } from ".."
import bcrypt from 'bcrypt'
import {v4} from 'uuid'
import mailService from "./mail.service"
import tokensService from "./tokens.service"
import { UserFromToken, UserSchema } from "../Models/user.module"
import { ApiError } from "../exceptions/api.error"

class UsersService{
    async getUsers(){
        const users = (await connection.query('SELECT * FROM users'))[0][0]

        return users
    }
    async findUser(user: UserFromToken){
       
        const foundUser = (await connection.query('SELECT * FROM users WHERE ID = ?', [user.id]))[0][0]
        return foundUser
    }
    async registration (email: string, password: string, username: string){
        const selectResults = (await connection.query('SELECT * from users WHERE email = ?', [email]))[0][0];
        
        if(selectResults){
            throw ApiError.BadRequest('Email already exist');
        }

        const id = v4();
        const hashedPassword = bcrypt.hashSync(password, 7);
        await connection.query("INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)" , [`${id}`, `${username}`, `${hashedPassword}`, `${email}`]) ;

        const createdUser = (await connection.query<UserSchema>('SELECT * FROM users WHERE USERNAME = ?', [`${username}`]))[0][0];

        mailService.sendActivationMail({to: email, link: `${process.env.BACKEND_URL}/api/activate/${id}`});

        const tokens = tokensService.generateTokens({id: createdUser.id, role: createdUser.role});
        await tokensService.saveToken({userId: createdUser.id, refreshToken: tokens.refreshToken});

        return {...tokens, createdUser}
    }
    async login(username: string, password: string){
        const user = (await connection.query('SELECT * from users WHERE username = ?', [username]))[0][0];
        if(!user){
            throw ApiError.BadRequest('User is undefined');
        }

        const isPassEqual = bcrypt.compareSync(password, user.password);
        if(!isPassEqual){
            throw ApiError.BadRequest('Incorrect password');
        }

        const tokens = tokensService.generateTokens({id: user.id, role: user.role});
        await tokensService.saveToken({userId: user.id, refreshToken: tokens.refreshToken});

        return {...tokens, user}

    }
    async logout(refreshToken: string){
        tokensService.removeRefreshToken(refreshToken);
    }
    async activate(activationLink: string){
        const selectResults = (await connection.query('SELECT * from users WHERE id = ?', [activationLink]))[0][0];
        if(!selectResults){
            throw ApiError.BadRequest('Incorrect activation link');
        }
        connection.query('UPDATE users SET isActivated = true');
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
        const user = (await connection.query('SELECT * from users WHERE id = ?', [userData.id]))[0][0];
        const tokens = tokensService.generateTokens({id: user.id, role: user.role});
        await tokensService.saveToken({userId: user.id, refreshToken: tokens.refreshToken});

        return {...tokens, user}

    }
}
export default new UsersService() 