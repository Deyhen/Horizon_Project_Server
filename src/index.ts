import express from "express";
import cors from "cors"
import * as dotenv from 'dotenv'
import session from 'express-session'
import mysql from 'mysql2/promise'
import {usersRouter} from "./Routes/users.router" 
import cookieParser  from "cookie-parser";
import ErrorsMiddleware from './Middlewares/errors.middleware'



dotenv.config()

const memoryStore = new session.MemoryStore();

const app = express()
const corsOptions = {
    origin: process.env.FRONTEND_URL, 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

 const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_LOGIN,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME, 
  insecureAuth : true,

}

 export const connection  =  mysql.createPool(mysqlConfig);



app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api',cors(corsOptions), usersRouter)
app.use(ErrorsMiddleware)

app.post('/')

app.listen(process.env.PORT, () => console.log('server is working'));



// connection.query("INSERT INTO users (id, username, password, 2f, email) VALUES (?, ?, ?, ?, ?)" , ['3', 'test3', 'test1233', '0', 'test3@test.com']) 
// const d = await connection.query('SELECT * FROM users ');

// console.log(d);