import { NextFunction, Request, Response } from 'express'
import userService from '../Services/users.service'
import * as dotenv from 'dotenv'
import authService from '../Services/auth.service'
import { ApiError } from '../exceptions/api.error'

dotenv.config()

class UsersController {
  async getUsers(req: Request, res: Response) {
    const users = await userService.getUsers()

    res.status(200).json(users)
  }
  async getUser(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw ApiError.UnauthorizedError()
        }

    const foundUser = await userService.findUser(token)

    res.status(200).json(foundUser)
  }
  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link

      await userService.activate(activationLink)

      res.redirect(process.env.FRONTEND_URL || '')
    } catch (error) {
      next(error)
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body

      if(!email){
        throw ApiError.BadRequest('Invalid email')
      }

      await userService.forgotPassword(email)

      res.status(200)
    } catch (error) {
      next(error)
    }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body

      const username = await userService.resetPassword(token, password)
      const userData = await authService.login(username, password)

      res.cookie('refreshToken', userData.tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        path: `${process.env.BACKEND_URL}/api/refresh`,
      })

      res
        .status(200)
        .json({ accessToken: userData.tokens.accessToken, user: userData.user })
    } catch (error) {
      next(error)
    }
  }
  async checkResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token
      if(!token){
        throw ApiError.UnauthorizedError()
      }

      const checkedToken = await userService.chekResetToken(token)

      res.status(200).json(checkedToken)
    } catch (error) {
      next(error)
    }
  }
  async changeSkin(req: Request, res: Response, next: NextFunction) {
    try {

        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw ApiError.UnauthorizedError()
        }else if(!req.file){
                throw ApiError.BadRequest('Invalid file')
        }
      const skinPath = `/skins/${req.file.filename}`

      await userService.changeSkin(skinPath, token)

      res.status(200).json({message: 'Success'})
    } catch (error) {
      next(error)
    }
  }
  async changeAvatar(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw ApiError.UnauthorizedError()
        }else if(!req.file){
                throw ApiError.BadRequest('Invalid file')
        }
        const avatarPath = `/avatars/${req.file.filename}`

        await userService.changeAvatar(avatarPath, token)

        res.status(200).json({message: 'Success'})
    } catch (error) {
      next(error)
    }
  }
  async changeCape(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw ApiError.UnauthorizedError()
        }else if(!req.file){
                throw ApiError.BadRequest('Invalid file')
        }

      const capePath = `/capes/${req.file.filename}`

      await userService.changeCape(capePath, token)
      res.status(200).json({message: 'Success'})
    } catch (error) {
      next(error)
    }
  }
  async activateEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        throw ApiError.UnauthorizedError()
      }

      await userService.activateEmail(token)

      res.status(200).json({message: 'Success'})
    } catch (error) {
      next(error)
    }
  }
  async activatePromocode(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const { promocode } = req.params

      if (!token) {
        throw ApiError.UnauthorizedError()
      }else if(!promocode){
          throw ApiError.BadRequest('Invalid promocode')
      }

      await userService.activatePromocode(promocode, token)

      res.status(200).json({message: 'Success'})
    } catch (error) {
      next(error)
    }
  }
  async changeUsername(req: Request, res: Response, next: NextFunction){
    try {
        const token = req.headers.authorization?.split(' ')[1]
        const {newUsername} = req.body

        if (!token) {
          throw ApiError.UnauthorizedError()
        }else if(!newUsername){
            throw ApiError.BadRequest('Invalid username')
        }
  
        await userService.changeUsername(newUsername, token)
  
        res.status(200).json({message: 'Success'})
      } catch (error) {
        next(error)
      }
  }
  async changePassword(req: Request, res: Response, next: NextFunction){
    try {
        const token = req.headers.authorization?.split(' ')[1]
        const {newPassword, currentPassword} = req.body
        
        if (!token) {
          throw ApiError.UnauthorizedError()
        }else if(!newPassword || !currentPassword){
            throw ApiError.BadRequest('Invalid password')
        }
  
        await userService.changePassword(newPassword, currentPassword, token)
  
        res.status(200).json({message: 'Success'})
      } catch (error) {
        next(error)
      }
  }
}

export default new UsersController()
