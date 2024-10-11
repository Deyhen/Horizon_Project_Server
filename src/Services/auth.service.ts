import { v4 } from 'uuid'
import { connection } from '..'
import mailService from './mail.service'
import { UserSchema } from '../Models/user.model'
import { ApiError } from '../exceptions/api.error'
import tokensService from './tokens.service'
import userDto from '../dto/user.dto'
import bcrypt from 'bcrypt'

class AuthService {
  async registration(email: string, password: string, username: string) {
    await this.chekUserExist({ email: email, username: username })

    mailService.sendActivationMail({ to: email, username: username })

    const id = v4()
    const hashedPassword = bcrypt.hashSync(password, 7)

    await connection.query(
      'INSERT INTO users (id, username, password, email, activatedPromocodes) VALUES (?, ?, ?, ?, ?)',
      [id, username, hashedPassword, email,  JSON.stringify([])]
    )
    const userSQL = (
      await connection.query<UserSchema[]>(
        'SELECT * FROM users WHERE username = ?',
        [username]
      )
    )[0][0]
    const createdUser = new userDto(userSQL)

    const tokens = tokensService.generateTokens({
      id: createdUser.id,
      role: createdUser.role,
    })
    await tokensService.saveToken({
      userId: createdUser.id,
      refreshToken: tokens.refreshToken,
    })

    return { tokens, createdUser }
  }
  async login(username: string, password: string) {
    const userSQL = (
      await connection.query<UserSchema[]>(
        'SELECT * from users WHERE username = ?',
        [username]
      )
    )[0][0]
    if (!userSQL) {
      throw ApiError.BadRequest('Користувач не знайден')
    }
    const user = new userDto(userSQL as UserSchema)

    const isPassEqual = bcrypt.compareSync(password, user.password)
    if (!isPassEqual) {
      throw ApiError.BadRequest('Некоректний пароль')
    }

    const tokens = tokensService.generateTokens({
      id: user.id,
      role: user.role,
    })
    await tokensService.saveToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    })

    return { tokens, user }
  }
  async logout(refreshToken: string) {
    tokensService.removeRefreshToken(refreshToken)

    return
  }
  async chekUserExist({
    email,
    username,
  }: {
    email: string
    username: string
  }) {
    const emailExist = (
      await connection.query<UserSchema[]>(
        'SELECT * from users WHERE email = ?',
        [email]
      )
    )[0][0]
    const usernameExist = (
      await connection.query<UserSchema[]>(
        'SELECT * from users WHERE username = ?',
        [username]
      )
    )[0][0]
    if (emailExist) {
      throw ApiError.BadRequest('Email вже існує')
    } else if (usernameExist) {
      throw ApiError.BadRequest('Логін вже існує')
    }
    return
  }
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }
    const userData = await tokensService.validateRefreshToken(refreshToken)
    const tokenData = await tokensService.findRefreshToken(refreshToken)

    if (!userData || !tokenData) {
      throw ApiError.UnauthorizedError()
    }

    const userSQL = (
      await connection.query<UserSchema[]>('SELECT * from users WHERE id = ?', [
        userData.id,
      ])
    )[0][0]
    const user = new userDto(userSQL as UserSchema)
    const tokens = tokensService.generateTokens({
      id: user.id,
      role: user.role,
    })

    await tokensService.saveToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    })

    return { tokens, user }
  }
}

export default new AuthService()
