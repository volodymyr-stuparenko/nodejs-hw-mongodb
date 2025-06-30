import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw createHttpError(401, 'Please provide Authorization header!');
  }

  const [bearer, token] = authHeader.split(' ');

  if (!(bearer === 'Bearer' && typeof token === 'string')) {
    throw createHttpError(401, 'Auth token must be of type Bearer!');
  }

  const session = await SessionsCollection.findOne({ accessToken: token });

  if (!session) {
    throw createHttpError(401, 'Session not found!');
  }

  if (session.accessTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Access token expired!');
  }

  const user = await UsersCollection.findById(session.userId);

  if (!user) {
    throw createHttpError(401, 'User not found!');
  }

  req.user = user;

  next();
};
