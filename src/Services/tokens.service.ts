/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt, { JwtPayload } from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { connection } from '..'
import { RefreshToken } from '../Models/token.model'
import { v4 } from 'uuid'
import { UserFromToken } from '../Models/user.model'

dotenv.config()

const AccessTokenKey = process.env.JWT_SECRET_ACCESS
const RefreshTokenKey = process.env.JWT_SECRET_REFRESH

if (!AccessTokenKey || !RefreshTokenKey) {
  throw new Error('JWT secrets are not defined in environment variables')
}

class TokensService {
  generateTokens({ id, role }: { id: string; role: string }) {
    try {
      const payload = { id, role }
      const accessToken = jwt.sign(payload, AccessTokenKey as string, {
        expiresIn: '15m',
      })
      const refreshToken = jwt.sign(payload, RefreshTokenKey as string, {
        expiresIn: '30d',
      })
      return {
        accessToken,
        refreshToken,
      }
    } catch (error) {
      throw new Error('Error in tokens generating')
    }
  }
  //this way results in only one active device
  async saveToken({
    userId,
    refreshToken,
  }: {
    userId: string
    refreshToken: string
  }) {
    const id = v4()
    await connection.query(
      `INSERT INTO refreshSessions (id, userId, refreshToken)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE refreshToken = ?`,
      [id, userId, refreshToken, refreshToken]
    )
    return
  }
  async removeRefreshToken(refreshToken: string) {
    await connection.query(
      'DELETE FROM refreshSessions WHERE refreshToken = ?',
      [refreshToken]
    )
  }
  private validateToken(token: string, secret: string): UserFromToken | null {
    try {
      return jwt.verify(token, secret) as UserFromToken
    } catch (error) {
      return null
    }
  }

  async validateAccessToken(accessToken: string) {
    return this.validateToken(accessToken, AccessTokenKey!)
  }

  async validateRefreshToken(refreshToken: string) {
    return this.validateToken(refreshToken, RefreshTokenKey!)
  }
  async findRefreshToken(refreshToken: string) {
    const tokenData = (
      await connection.query(
        'SELECT * FROM refreshSessions WHERE refreshToken = ?',
        [refreshToken]
      )
    )[0]
    return tokenData
  }
  async getIdByToken(token: string) {
    const { id } = jwt.verify(
      token,
      process.env.JWT_SECRET_ACCESS!
    ) as JwtPayload

    return id
  }
}
export default new TokensService()
