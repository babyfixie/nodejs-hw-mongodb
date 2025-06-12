import {
  registerService,
  loginService,
  refreshService,
  logoutService,
} from '../services/auth.js';

export const registerUser = async (req, res, next) => {
  try {
    const user = await registerService(req.body);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, sessionId } = await loginService(
      req.body
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const sessionId = req.cookies.sessionId;

    const {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId: newSessionId,
    } = await refreshService(refreshToken, sessionId);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('sessionId', newSessionId, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed session!',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;

    await logoutService(sessionId);

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).json({
      status: 204,
      message: 'Successfully logged out',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
