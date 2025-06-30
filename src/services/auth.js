import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';

const createSession = () => ({
  accessToken: crypto.randomBytes(30).toString('base64'),
  refreshToken: crypto.randomBytes(30).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES), // 15 minutes
  refreshTokenValidUntil: new Date(Date.now() + ONE_DAY), // 1 day
});

export const registerUser = async (payload) => {
  const existingUser = await UsersCollection.findOne({ email: payload.email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const user = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });

  return user;
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(401, 'User login and password does not match!');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'User login and password does not match!');
  }

  await SessionsCollection.findOneAndDelete({ userId: user._id });

  const sessions = await SessionsCollection.create({
    ...createSession(),
    userId: user._id,
  });

  return sessions;
};

export const refreshUsersSession = async (sessionId, refreshToken) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found!');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await SessionsCollection.findByIdAndDelete(sessionId);

    throw createHttpError(401, 'Session token expired!');
  }

  await SessionsCollection.findByIdAndDelete(sessionId);

  const newSessionsColllection = await SessionsCollection.create({
    ...createSession(),
    userId: session.userId,
  });

  return newSessionsColllection;
};

export const logoutUser = async (sessionId, refreshToken) => {
  await SessionsCollection.findOneAndDelete({
    _id: sessionId,
    refreshToken,
  });
};
