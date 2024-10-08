import { Request, Response } from 'express'
import { ApiError } from '../exceptions/api.error'

export default function (error: Error, req: Request, res: Response) {
  if (error instanceof ApiError) {
    console.log(error)
    return res
      .status(error.status)
      .json({ message: error.message, errors: error.errors })
  }
  return res.status(500).send('Unexpected Error').json({ message: error })
}
