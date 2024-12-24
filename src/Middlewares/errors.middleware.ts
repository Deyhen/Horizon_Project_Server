import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../exceptions/api.error'

export default function (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .json({ message: error.message, errors: error.errors })
  }
  return res.status(500).send('Unexpected Error').json({ message: error })
}
