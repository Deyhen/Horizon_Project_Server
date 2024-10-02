import nodemailer, { Transporter } from 'nodemailer'
import * as dotenv from "dotenv"
import jwt from 'jsonwebtoken'

dotenv.config()

class MailService{
    transporter: Transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

     sendActivationMail({to, username}: {to: string, username: string}){
        
        const activationLink = jwt.sign({email: to}, process.env.JWT_SECRET_EMAIL as string, {expiresIn: '15m'})

        this.transporter.sendMail({
            from: process.env.SMTP_USE,
            to,
            subject: 'Активація акаунту на Ukraine Horizon',
            text: '',
            html:
                `
                    <div>
                        <h1>Для активація перейдіть по посиланню:</h1>
                        <a href=${process.env.BACKEND_URL}/api/activate/${activationLink + " " + username}>${activationLink}</a>
                    </div>

                `
        }, (error, info) => {
            if (error) {
              console.error('Email sending failed:', error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })
    }
}
export default new MailService()