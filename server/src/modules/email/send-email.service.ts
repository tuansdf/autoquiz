import nodemailer from "nodemailer";
import { Env } from "../../env";

const transporter = nodemailer.createTransport({
  host: Env.MAIL_HOST,
  port: Env.MAIL_PORT,
  secure: true,
  auth: {
    user: Env.MAIL_USERNAME,
    pass: Env.MAIL_PASSWORD,
  },
});

class SendEmailService {
  public async send(options: { to: string; subject: string; body: string }) {
    await transporter.sendMail({
      from: `"${Env.MAIL_FROM_NAME}" <${Env.MAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.body,
    });
  }
}

export const sendEmailService = new SendEmailService();
