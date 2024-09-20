import { ResultSetHeader, RowDataPacket } from "mysql2"

export interface User {
    id: string
    username: string,
    password: string,
    email: string
}
export interface userSignUp{
    username: string,
    password: string
    email: string
}
export interface userSignIn{
    username: string,
    password: string
}

export interface UserFromMysql extends  ResultSetHeader {
    id: string
    username: string,
    password: string,
    email: string
}