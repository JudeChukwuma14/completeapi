const nodemailer = require('nodemailer');
const host = process.env.SMTP_HOST
const port = process.env.SMTP_PORT
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS

const SendingMail = (option) => {
    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            auth: {
                user: user,
                pass: pass
            }
        })

        const mailOption = {
            from: "janapi@gmail.com",
            to: option.email,
            subject: option.subject,
            text: option.message
        }
        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                console.log('Error occurred while sending mail: ', error.message);
                return false;
            } else {
                console.log('Mail sent successfully: ', info.response);
                return true;
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = SendingMail