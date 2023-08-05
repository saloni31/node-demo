const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // create transporter
    const transporter = nodemailer.createTransport({
        service : 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // add options
    const mailOptions = {
        from : 'NATOURS APP <saloni@gmail.com>',
        to : options.email,
        subject : options.subject,
        text : options.message,
        // html: can provide html content 
    }

    // send email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;