import nodemailer from 'nodemailer';

import 'dotenv/config';
import { getEnvVar } from './getEnvVar.js';

const transporter = nodemailer.createTransport({
  host: getEnvVar('SMTP_HOST'),
  port: Number(getEnvVar('SMTP_PORT')),
  auth: {
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASSWORD'),
  },
});

export const sendEmail = async (option) => {
  return await transporter.sendMail(option);
};