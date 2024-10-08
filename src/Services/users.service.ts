import { connection } from '..'
import bcrypt from 'bcrypt'
import mailService from './mail.service'
import {
  PromocodeSchema,
  UserSchema,
} from '../Models/user.model'
import { ApiError } from '../exceptions/api.error'
import jwt, { JwtPayload } from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
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
      throw new Error('Invalid token or ID not found');
    }
    const foundUser = (
      await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
        id,
      ])
    )[0][0]
    return foundUser
  }
  async activate(activationLink: string) { 
    const email = (jwt.decode(activationLink) as JwtPayload).email

    const selectResults = (
      await connection.query<UserSchema[]>(
        'SELECT * from users WHERE email = ?',
        [email]
      )
    )[0][0]

    if (!selectResults) {
      throw ApiError.BadRequest('Incorrect activation link')
    }

    connection.query('UPDATE users SET isActivated = true WHERE email = ?', [
      email,
    ])
  }
  async forgotPassword(email: string) {
    const token = bcrypt.hashSync(email, 7)
    const expires = new Date(Date.now() + 3600000) // 1 hour

    const [result] = await connection.query(
      'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?',
      [token, expires, email]
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((result as any).affectedRows === 0) {
      throw ApiError.BadRequest('Username already exist')
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
      throw ApiError.BadRequest('Invalid or expired token.')
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
      throw ApiError.BadRequest('Invalid reset token')
    }

    return user.resetPasswordToken
  }
  async changeSkin(skinPath: string, token: string) {
    const id = await tokensService.getIdByToken(token)

    const oldUser = (
      await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
        id,
      ])
    )[0][0]
    if (oldUser.skinPath) {
      const filePath = path.join(process.cwd(), 'static', oldUser.skinPath)

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`)
          return
        }

      })
    }

    await connection.query('UPDATE users SET skinPath = ? WHERE id = ?', [
      skinPath,
      id,
    ])

    return 
  }
  async changeAvatar(avatarPath: string, token: string) {
    const id = await tokensService.getIdByToken(token)

    const oldUser = (
      await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
        id,
      ])
    )[0][0]

    if (oldUser.avatarPath) {
      const filePath = path.join(process.cwd(), 'static', oldUser.avatarPath)

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`)
          return
        }

      })
    }

    await connection.query('UPDATE users SET avatarPath = ? WHERE id = ?', [
      avatarPath,
      id,
    ])
    
    return 
  }


  async changeCape(capePath: string, token: string) {
    const id = await tokensService.getIdByToken(token)

    const oldUser = (
      await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
        id,
      ])
    )[0][0]

    if (oldUser.capePath) {
      const filePath = path.join(process.cwd(), 'static', oldUser.capePath)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`)
          return
        }
      })
    }
    await connection.query('UPDATE users SET capePath = ? WHERE id = ?', [
      capePath,
      id,
    ])

    return 
  }
  async activateEmail(token: string) {
    const id = await tokensService.getIdByToken(token)

    const user = (
      await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
        id,
      ])
    )[0][0]
    mailService.sendActivationMail({ to: user.email, username: user.username })

    return
  }
  async activatePromocode(promocode: string, token: string) {
    const id =  await tokensService.getIdByToken(token)

    if (!id) {
      throw ApiError.UnauthorizedError()
    }

    const oldUser = (
      await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
        id,
      ])
    )[0][0]

    const promocodeData = (
      await connection.query<PromocodeSchema[]>(
        'SELECT * FROM promocodes WHERE name = ?',
        [promocode]
      )
    )[0][0]

    if (!promocodeData) {
      throw ApiError.BadRequest('Promocode does not exist')
    }

    await connection.query(
      'UPDATE users SET donateCurrency = ?, gameCurrency = ? WHERE id = ?',
      [
        oldUser.donateCurrency + promocodeData.bonusDonateCurrency,
        oldUser.gameCurrency + promocodeData.bonusGameCurrency,
        id,
      ]
    )

    await connection.query('DELETE FROM promocodes WHERE id = ?', [
      promocodeData.id,
    ])

    return 
  }
  async changeUsername(newUsername: string, token: string,){
    const id = await tokensService.getIdByToken(token)
    console.log(id, newUsername);
    await connection.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, id])

    return 
  }
  async changePassword(newPassword: string, currentPassword: string, token: string,){
    const id = await tokensService.getIdByToken(token)
    const user = (
        await connection.query<UserSchema[]>('SELECT * FROM users WHERE id = ?', [
            id,
        ])
      )[0][0]
    const isPassEqual = bcrypt.compareSync(currentPassword, user.password)
    if (!isPassEqual) {
    throw ApiError.BadRequest('Incorrect password')
    }
    const hashedNewPassword = bcrypt.hashSync(newPassword, 7)
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, id])
    return
  }
}
export default new UsersService()
