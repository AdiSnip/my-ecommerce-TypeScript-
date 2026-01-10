import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.NODEMAILER_APP_PASSWORD
    }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: `"Security Team" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html
    };

    return await transporter.sendMail(mailOptions);
};
