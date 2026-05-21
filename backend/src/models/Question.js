import mongoose from 'mongoose';

/**
 * A practice question. Two flavors:
 *   - built-in (createdBy=null, isBuiltIn=true) — seeded; only admins edit.
 *   - user-custom (createdBy set, isBuiltIn=false) — created from the Library UI.
 *
 * Difficulty is a normalized enum so analytics can pivot on it cleanly.
 */
const questionSchema = new mongoose.Schema(
  {
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
      index: true,
    },
    topic:      { type: String, required: true, trim: true, default: 'General' },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      index: true,
    },
    question:  { type: String, required: true, minlength: 10, maxlength: 2000 },
    timeLimit: { type: Number, default: 120, min: 15, max: 600 },

    isBuiltIn: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    active:    { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, versionKey: false, transform: stripId },
    toObject: { virtuals: true, versionKey: false, transform: stripId },
  },
);

function stripId(_doc, ret) { delete ret._id; return ret; }

questionSchema.virtual('id').get(function id() { return this._id?.toHexString(); });

// Compound index that powers the most common query: "give me questions for
// this domain at this difficulty, active first".
questionSchema.index({ domain: 1, difficulty: 1, active: 1 });

export default mongoose.model('Question', questionSchema);
