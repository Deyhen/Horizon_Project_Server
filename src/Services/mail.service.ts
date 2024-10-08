import nodemailer, { Transporter } from 'nodemailer'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

class MailService {
  transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  sendActivationMail({ to, username }: { to: string; username: string }) {
    const activationLink = jwt.sign(
      { email: to },
      process.env.JWT_SECRET_EMAIL as string,
      { expiresIn: '15m' }
    )
    const link = `${process.env.BACKEND_URL}/api/activate/${activationLink + ' ' + username}`

    this.transporter.sendMail(
      {
        from: process.env.SMTP_USE,
        to,
        subject: 'Активація акаунту на Ukraine Horizon',
        text: '',
        html: `
                    <div>
                        <h1>Для активації аккаунту перейдіть по посиланню:</h1>
                        <a href=${link}>АКТИВУВАТИ</a>
                    </div>

                `,
      },
      (error, info) => {
        if (error) {
          console.error('Email sending failed:', error)
        } else {
          console.log('Email sent: ' + info.response)
        }
      }
    )
    return
  }
  sendPasswordResetLink(email: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Відновлення паролю',
      text: ``,
      html: `
                <div>
                    <h1>Для відновлення паролю перейдіть по посиланню:</h1>
                    <a href=${resetLink}>ВІДНОВИТИ</a>
                </div>
            `,
    }
    this.transporter.sendMail(mailOptions)
    return
  }
}
export default new MailService()
