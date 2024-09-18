import express from "express";
import cors from "cors"
import * as dotenv from 'dotenv'
import session from 'express-session'
import mysql from 'mysql'
import {usersRouter} from "./Routes/usersRouter" 



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

export const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_LOGIN,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME, 
  insecureAuth : true,

});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack); 
    return;
  }
  console.log('Connected to MySQL as ID ' + db.threadId);
});
// Routes


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api',cors(corsOptions), usersRouter)

app.post('/')

app.listen(process.env.PORT, () => console.log('server is working'));
