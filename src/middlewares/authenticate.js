import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Authorization header missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw createError(401, 'Access token expired');
      }
      throw createError(401, 'Invalid access token');
    }

    const session = await Session.findOne({
      userId: payload.userId,
      accessToken: token,
    });
    if (!session) {
      throw createError(401, 'Session not found or logged out');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw createError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
