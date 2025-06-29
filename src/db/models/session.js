import { model, Schema, Types } from 'mongoose';
import { UsersCollection } from './user.js';

const sessionsSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: UsersCollection,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SessionsCollection = model('sessions', sessionsSchema);
