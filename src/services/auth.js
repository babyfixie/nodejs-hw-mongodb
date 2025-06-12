import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../db/models/User.js';
import { Session } from '../db/models/Session.js';
import { randomBytes } from 'crypto';
import {
  accessTokenLifeTime,
  refreshTokenLifeTime,
} from '../constants/auth.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import Handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMPLATES_DIR } from '../constants/index.js';

const createSession = () => {
  const accessToken = randomBytes(32).toString('hex');
  const refreshToken = randomBytes(32).toString('hex');
  const accessTokenValidUntil = Date.now() + accessTokenLifeTime;
  const refreshTokenValidUntil = Date.now() + refreshTokenLifeTime;
  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

export const findSession = (query) => Session.findOne(query);
export const findUserById = (query) => User.findOne(query);

export const registerUser = async (payload) => {
  const { email, password } = payload;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return await User.create({
    ...payload,
    password: hashedPassword,
  });
};

export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '15m' },
  );
  const resetPassword = path.join(TEMPLATES_DIR, 'reset-password-email.html');
  const templateSource = (await fs.readFile(resetPassword)).toString();
  const template = Handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  const sendEmailResult = await sendEmail({
    from: getEnvVar('SMTP_FROM'),
    to: email,
    subject: 'Reset password',
    html,
  });
  if (!sendEmailResult) {
    throw createHttpError(500, 'Failed to send email');
  }
  return sendEmailResult;
};

export const resetPassword = async (payload) => {
  let entries;
  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (error) {
    if (error) throw createHttpError(401, 'Invalid token');
  }
  const user = await User.findOne({
    _id: entries.sub,
    email: entries.email,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });
  await Session.deleteOne({ userId: user._id });
};

export const loginUser = async (payload) => {
  const { email, password } = payload;

  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  await Session.findOneAndDelete({ userId: user._id });

  const session = createSession();
  return await Session.create({
    userId: user._id,
    ...session,
  });
};

export const refreshUser = async ({ refreshToken, sessionId }) => {
  const session = await findSession({ refreshToken, _id: sessionId });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  if (session.refreshTokenValidUntil < Date.now()) {
    await Session.findOneAndDelete({ _id: session._id });
    throw createHttpError(401, 'Session token expired');
  }

  await Session.findOneAndDelete({ _id: session._id });

  const newSession = createSession();

  return Session.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};
