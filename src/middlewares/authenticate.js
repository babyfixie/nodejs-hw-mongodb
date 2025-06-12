import createHttpError from 'http-errors';
import { findSession, findUserById } from '../services/auth.js';

export const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(createHttpError(401, 'Access token expired'));
  }

  const [bearer, accessToken] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    return next(createHttpError(401, 'Header must have type Bearer'));
  }
  const session = await findSession({ accessToken });
  if (!session) {
    return next(createHttpError(401, 'Session not fount'));
  }
  if (session.accessTokenValidUntil < Date.now) {
    return next(createHttpError(401, 'Access token expired'));
  }
  const user = await findUserById({ _id: session.userId });
  
  if (!user) {
    return next(createHttpError(401, 'User not found'));
  }
  req.user = user;
  next();
};
