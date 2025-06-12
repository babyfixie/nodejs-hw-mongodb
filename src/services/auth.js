import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import createError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid email or password');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw createError(401, 'Invalid email or password');

  await Session.findOneAndDelete({ userId: user._id });

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken, sessionId: session._id };
};

export const refreshService = async (refreshToken, sessionId) => {
  if (!refreshToken) throw createError(401, 'No refresh token provided');
  if (!sessionId) throw createError(401, 'No session ID provided');

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw createError(403, 'Invalid refresh token');
  }

  const session = await Session.findOne({
    _id: sessionId,
    userId: payload.userId,
    refreshToken,
  });
  if (!session) throw createError(403, 'Session not found');

  await Session.deleteOne({ _id: sessionId });

  const accessToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const newRefreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  const newSession = await Session.create({
    userId: payload.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    sessionId: newSession._id,
  };
};

export const logoutService = async (sessionId) => {
  if (!sessionId) {
    throw createError(401, 'No session ID provided');
  }

  const session = await Session.findById(sessionId);
  if (!session) throw createError(401, 'Session not found');

  await Session.findByIdAndDelete(sessionId);
};
