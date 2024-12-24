import { connection } from '..'
import bcrypt from 'bcrypt'
import mailService from './mail.service'
import { UserSchema } from '../Models/user.model'
import { ApiError } from '../exceptions/api.error'
import jwt, { JwtPayload } from 'jsonwebtoken'
import tokensService from './tokens.service'

class UsersService {
  async getUsers() {
    const users = (
      await connection.query<UserSchema[]>('SELECT * FROM users')
    )[0][0]

    return users
  }
  async findUser(token: string) {
    const id = await tokensService.getIdByToken(token)

    if (!id) {
      throw new Error('Invalid token or ID not found')
    }
    const foundUser = this.getUserByField('id', id)
    return foundUser
  }
  async activate(activationLink: string) {
    const email = (jwt.decode(activationLink) as JwtPayload).email

    const selectResults = await this.getUserByField('email', email)

    if (!selectResults) {
      throw ApiError.BadRequest('Некоректне посилання')
    }

    connection.query('UPDATE users SET isActivated = true WHERE email = ?', [
      email,
    ])
  }
  async forgotPassword(email: string) {
    const token = bcrypt.hashSync(email, 7).replace(/\//g, '_')
    const expires = new Date(Date.now() + 3600000) // 1 hour

    const [result] = await connection.query(
      'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?',
      [token, expires, email]
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((result as any).affectedRows === 0) {
      throw ApiError.BadRequest('Логін вже існує')
    }
    mailService.sendPasswordResetLink(email, token)

    return
  }
  async resetPassword(token: string, newPassword: string) {
    const user = (
      await connection.query<UserSchema[]>(
        'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
        [token, new Date()]
      )
    )[0][0]

    if (!user) {
      throw ApiError.BadRequest(
        'Посилання некоректне або строк його дії вийшов'
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 7)

    await connection.query(
      'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    )

    return user.username
  }
  async chekResetToken(token: string) {
    const user = (
      await connection.query<UserSchema[]>(
        'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
        [token, new Date()]
      )
    )[0][0]
    if (!user) {
      throw ApiError.BadRequest('Некоректне посилання')
    }

    return user.resetPasswordToken
  }
  async changeSkin(skinPath: string, token: string) {
    return this.updateUserPath('skinPath', skinPath, token)
  }

  async changeAvatar(avatarPath: string, token: string) {
    return this.updateUserPath('avatarPath', avatarPath, token)
  }

  async changeCape(capePath: string, token: string) {
    return this.updateUserPath('capePath', capePath, token)
  }
  async activateEmail(token: string) {
    const id = await tokensService.getIdByToken(token)

    const user = await this.getUserByField('id', id)
    mailService.sendActivationMail({ to: user.email, username: user.username })

    return
  }
  async changeUsername(newUsername: string, token: string) {
    const id = await tokensService.getIdByToken(token)

    const usernameExist = await this.getUserByField('username', newUsername)

    if (usernameExist) {
      throw ApiError.BadRequest('Логін вже існує')
    }

    await connection.query('UPDATE users SET username = ? WHERE id = ?', [
      newUsername,
      id,
    ])

    return
  }
  async changePassword(
    newPassword: string,
    currentPassword: string,
    token: string
  ) {
    const id = await tokensService.getIdByToken(token)
    const user = await this.getUserByField('id', id)

    const isPassEqual = bcrypt.compareSync(currentPassword, user.password)

    if (!isPassEqual) {
      throw ApiError.BadRequest('Невірний активний пароль')
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 7)
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [
      hashedNewPassword,
      id,
    ])
    return
  }
  async getUserByField(field: string, value: string) {
    const query = `SELECT * FROM users WHERE ${field} = ?`
    const user = (await connection.query<UserSchema[]>(query, [value]))[0][0]
    return user || null
  }
  private async updateUserPath(
    field: 'skinPath' | 'avatarPath' | 'capePath',
    path: string,
    token: string
  ): Promise<string> {
    const id = await tokensService.getIdByToken(token)
    await connection.query(`UPDATE users SET ${field} = ? WHERE id = ?`, [
      path,
      id,
    ])
    return `${path}?t=${new Date().getTime()}`
  }
}
export default new UsersService()
