import { ResultSetHeader } from "mysql2"

export interface TokensSchema{
    accessToken: string,
    refreshToken: string
}
export interface RefreshToken extends ResultSetHeader{
    id: string,
    userId: string,
    refreshToken: string,
    ua: string, /* user-agent */
    fingerprint: string,
    ip: string,
    expiresIn: string,
    createdAt: Date
    
}