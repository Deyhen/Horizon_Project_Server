import jwt, { JwtPayload } from "jsonwebtoken"
import * as dotenv from 'dotenv'
import { connection } from ".."
import { RefreshToken } from "../Models/token.module"
import {v4} from 'uuid'
import { UserFromToken } from "../Models/user.module"

dotenv.config()

const AccessTokenKey = process.env.JWT_SECRET_ACCESS
const RefreshTokenKey = process.env.JWT_SECRET_REFRESH

class TokensService{
    generateTokens({id, role}: {id: string, role: string}){
        try {
            const payload = {id, role}
            const accessToken = jwt.sign(payload, AccessTokenKey as string, {expiresIn: "30m"})
            const refreshToken = jwt.sign(payload, RefreshTokenKey as string, {expiresIn: "30d"})
            return{
                accessToken,
                refreshToken
            }
        } catch (error) {

           throw new Error('Error in tokens generating')
           
        }
    }
    //this way results in only one active device
    async saveToken({userId, refreshToken}: {userId: string, refreshToken: string}){
        try {
            const tokenData = (await connection.query<RefreshToken>('SELECT * FROM refreshSessions WHERE userId = ?', [userId]))[0] 
            if(tokenData){
                await connection.query('UPDATE refreshSessions SET refreshToken = ? WHERE userId = ?', [refreshToken, userId])
            }
            const id = v4()
            await connection.query('INSERT INTO refreshSessions (id, userId, refreshToken) VALUES (?, ?, ?)', [id, userId, refreshToken])
            const token = (await connection.query('SELECT * FROM refreshSessions WHERE id = ?', [id]))[0]
            return token
        } catch (error) {
            console.log(error);
        }
    }
    async removeRefreshToken(refreshToken: string){
        connection.query('DELETE FROM refreshSessions WHERE refreshToken = ?', [refreshToken])
    }
    async validateAccessToken(accessToken: string){
        try {
            const userData = jwt.verify(accessToken, process.env.JWT_SECRET_ACCESS || '')
            return userData as UserFromToken
        } catch (error) {
            return null
        }
    }
    async validateRefreshToken(refreshToken: string){
        try {
            const userData = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH || '') as UserFromToken
            return userData as UserFromToken
        } catch (error) {
            return null
        }
    }
    async findRefreshToken(refreshToken: string){
        const tokenData = (await connection.query('SELECT * FROM refreshSessions WHERE refreshToken = ?', [refreshToken]))[0][0]
        return tokenData
    }
}
export default new TokensService()