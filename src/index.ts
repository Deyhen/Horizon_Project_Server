import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import session from 'express-session'
import mysql from 'mysql2/promise'
import cookieParser from 'cookie-parser'
import { postsRouter } from './Routes/posts.router'
import { serversRouter } from './Routes/servers.router'
import errorHandlerMiddleware from './Middlewares/errors.middleware'
import { usersRouter } from './Routes/users.router.js'
import { authRouter } from './Routes/auth.router'

dotenv.config()

const memoryStore = new session.MemoryStore()

const app = express()

const allowedOrigins = [process.env.FRONTEND_URL]

const corsOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
)

const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_LOGIN,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
  insecureAuth: true,
}

export const connection = mysql.createPool(mysqlConfig)

app.use(express.static('static'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', usersRouter, postsRouter, serversRouter, authRouter)

app.use(errorHandlerMiddleware)

app.listen(process.env.PORT, () => console.log('server is working'))
