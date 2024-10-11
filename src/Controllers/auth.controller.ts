import { matchedData, validationResult } from 'express-validator'
import { ApiError } from '../exceptions/api.error'
import { NextFunction, Request, Response } from 'express'
import authService from '../Services/auth.service'

class AuthController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest('Помилка у валідації', errors.array()))
      }
      const data = matchedData(req)

      const { username, email, password } = data

      const userData = await authService.registration(email, password, username)

      res.cookie('refreshToken', userData.tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        path: `${process.env.BACKEND_URL}/api/refresh`,
      })

      res.status(200).json({
        accessToken: userData.tokens.accessToken,
        user: userData.createdUser,
      })
    } catch (error) {
      next(error)
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        next(ApiError.BadRequest('Помилка у валідації', errors.array()))
      }
      const data = matchedData(req)

      const userData = await authService.login(data.username, data.password)

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
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies
      await authService.logout(refreshToken)
      res.clearCookie('refreshToken', {
        httpOnly: true,
        path: `${process.env.BACKEND_URL}/api/refresh`,
      })
      res.status(200).json('Logout is success').end()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies

      const userData = await authService.refresh(refreshToken)
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
}

export default new AuthController()
