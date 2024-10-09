import { ResultSetHeader } from 'mysql2'

export interface UserSchema extends ResultSetHeader {
  id: string
  username: string
  password: string
  email: string
  twoFa: boolean
  isActivated: boolean
  role: string
  gameCurrency: number
  donateCurrency: number
  resetPasswordToken: string
  resetPasswordExpires: Date
  skinPath: string
  capePath: string
  avatarPath: string
  activatedPromocodes:  string[]
}
export interface UserFromToken {
  id: string
  role: string
  isActivated: boolean
}

export interface User {
  id: string
  username: string
  password: string
  email: string
}
export interface PromocodeSchema extends ResultSetHeader {
  name: string
  id: string
  bonusDonateCurrency: number
  bonusGameCurrency: number
}
