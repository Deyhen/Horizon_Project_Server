import { ResultSetHeader, RowDataPacket } from "mysql2"


export interface UserSchema extends  ResultSetHeader {
    id: string,
    username: string,
    password: string,
    email: string,
    twoFa: boolean,
    isActivated: boolean,
    role: string
}
export interface UserFromToken{
    id: string,
    role: string,
    isActivated: boolean
}

export interface User {
    id: string
    username: string,
    password: string,
    email: string
}