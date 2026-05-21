import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

/**
 * Application user. Two roles:
 *   - "user"   — can manage their own interviews, custom questions, prefs.
 *   - "admin"  — full platform read + can manage built-in questions and view stats.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name is too short'],
      maxlength: [80, 'Name is too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never serialize by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    preferredDomain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain',
      default: null,
    },
    avatarUrl: { type: String, default: '' },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: stripSensitive },
    toObject: { virtuals: true, versionKey: false, transform: stripSensitive },
  },
);

function stripSensitive(_doc, ret) {
  delete ret.passwordHash;
  delete ret._id;
  return ret;
}

userSchema.virtual('id').get(function virtualId() {
  return this._id?.toHexString();
});

// Virtual setter — `user.password = 'plain'` stashes the plaintext until
// pre-validate runs, at which point we hash it into passwordHash. This MUST
// be pre('validate') (not pre('save')) because Mongoose runs validation
// before save hooks, and passwordHash is required.
userSchema.virtual('password').set(function setPassword(plain) {
  this._plainPassword = plain;
});

userSchema.pre('validate', async function hashPlainPassword(next) {
  if (!this._plainPassword) return next();
  try {
    this.passwordHash = await bcrypt.hash(this._plainPassword, env.BCRYPT_ROUNDS);
    this._plainPassword = undefined;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
