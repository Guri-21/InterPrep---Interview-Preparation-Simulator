import mongoose from 'mongoose';

/**
 * An interview domain (DSA, System Design, Frontend, etc.).
 * Seeded once from `src/seed/seed.js`; admins can add new domains via the API.
 *
 * `slug` is the stable identifier the frontend uses in URLs (/interview/:slug).
 */
const domainSchema = new mongoose.Schema(
  {
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    label:       { type: String, required: true, trim: true },
    shortLabel:  { type: String, required: true, trim: true },
    blurb:       { type: String, default: '' },
    tagline:     { type: String, default: '' },
    iconKey:     { type: String, default: 'Binary' },
    accent:      { type: String, default: 'from-brand-400 to-cyan-400' },
    skills:      { type: [String], default: [] },
    order:       { type: Number, default: 0, index: true },
    active:      { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, versionKey: false, transform: stripId },
    toObject: { virtuals: true, versionKey: false, transform: stripId },
  },
);

function stripId(_doc, ret) { delete ret._id; return ret; }

domainSchema.virtual('id').get(function id() { return this._id?.toHexString(); });

export default mongoose.model('Domain', domainSchema);
