import { ResultSetHeader } from 'mysql2'

export interface Server extends ResultSetHeader {
  title: string
  ip: string
  port?: string
  type: string
  playersNow: number
}
export interface MinecraftAPIReq {
  ip: string
  port?: string
}
export interface MinecraftAPIRes {
  status: string
  online: boolean
  motd: string
  motd_json: {
    extra: [
      {
        color: string
        text: string
      },
    ]
    text: string
  }
  favicon: string
  error: null
  players: {
    max: number
    now: number
    sample: []
  }
  server: {
    name: string
    protocol: number
  }
  last_updated: string
  duration: string
}
