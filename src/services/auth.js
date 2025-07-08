import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  ONE_DAY,
  SMTP,
  JWT_SECRET,
} from '../constants/index.js';
import { TEMPLATE_DIR } from '../constants/paths.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';

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

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar(JWT_SECRET),
    {
      expiresIn: '5m',
    },
  );

  const resetPasswordTemplate = fs
    .readFileSync(path.join(TEMPLATE_DIR, 'send-reset-password-email.html'))
    .toString();

  const template = Handlebars.compile(resetPasswordTemplate);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (err) {
    console.error(err);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (payload) => {
  let tokenPayload;

  try {
    tokenPayload = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await UsersCollection.findOne({
    email: tokenPayload.email,
    _id: tokenPayload.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
