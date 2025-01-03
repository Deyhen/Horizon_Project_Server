import { v4 } from 'uuid'
import { connection } from '..'
import { UserSchema } from '../Models/user.model'
import { ApiError } from '../exceptions/api.error'
import tokensService from './tokens.service'
import bcrypt from 'bcrypt'
import mailService from './mail.service'
import usersService from './users.service'

class AuthService {
  async registration(email: string, password: string, username: string) {
    await this.chekUserExist({ email, username })
    const user = await this.createUser(email, password, username)
    mailService.sendActivationMail({ to: user.email, username: user.username })
    const tokens = await this.generateUserTokens(user)
    return { tokens, user }
  }
  private async createUser(email: string, password: string, username: string) {
    const id = v4()
    const hashedPassword = await bcrypt.hash(password, 7)
    await connection.query(
      'INSERT INTO users (id, username, password, email, activatedPromocodes) VALUES (?, ?, ?, ?, ?)',
      [id, username, hashedPassword, email, JSON.stringify([])]
    )
    return usersService.getUserByField('username', username)
  }
  private async generateUserTokens(user: UserSchema) {
    const tokens = tokensService.generateTokens({
      id: user.id,
      role: user.role,
    })
    await tokensService.saveToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    })
    return tokens
  }
  async login(username: string, password: string) {
    const user = (
      await connection.query<UserSchema[]>(
        'SELECT * from users WHERE username = ?',
        [username]
      )
    )[0][0]
    if (!user) {
      throw ApiError.BadRequest('Користувач не знайден')
    }

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
    const [emailExist, usernameExist] = await Promise.all([
      usersService.getUserByField('email', email),
      usersService.getUserByField('username', username),
    ])
    if (emailExist) throw ApiError.BadRequest('Email exists')
    if (usernameExist) throw ApiError.BadRequest('Username exists')
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

    const user = await usersService.getUserByField('id', userData.id)

    const tokens = await this.generateUserTokens(user)

    return { tokens, user }
  }
}

export default new AuthService()
