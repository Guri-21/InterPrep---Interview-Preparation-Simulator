import mongoose from 'mongoose';

/**
 * One interview session — created at /api/analyze success time.
 * `feedback` is the full structured response from the AI evaluator; we store
 * the whole shape so the Results page can render it without re-querying.
 *
 * Indexed by (user, createdAt) for fast paginated history queries.
 */
const scoresSchema = new mongoose.Schema(
  {
    Content:       { type: Number, min: 0, max: 100 },
    Structure:     { type: Number, min: 0, max: 100 },
    Clarity:       { type: Number, min: 0, max: 100 },
    Confidence:    { type: Number, min: 0, max: 100 },
    Communication: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const feedbackSchema = new mongoose.Schema(
  {
    scores:     { type: scoresSchema, default: {} },
    overall:    { type: Number, min: 0, max: 100 },
    summary:    { type: String, default: '' },
    strengths:  { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    followUp:   { type: String, default: '' },
    communication: {
      tone:       { type: String, default: '' },
      pacing:     { type: String, default: '' },
      fillerNote: { type: String, default: '' },
    },
  },
  { _id: false },
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
      index: true,
    },
    domainSlug: { type: String, required: true, index: true }, // denormalized for fast lookup
    question:   { type: String, required: true },
    questionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    topic:       { type: String, default: 'General' },
    difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },

    transcript:  { type: String, default: '' },
    durationSec: { type: Number, default: 0, min: 0 },
    wpm:         { type: Number, default: 0, min: 0 },
    fillerCount: { type: Number, default: 0, min: 0 },

    feedback:    { type: feedbackSchema, default: () => ({}) },

    providerModel: { type: String, default: '' }, // e.g. claude-sonnet-4-5
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, versionKey: false, transform: stripId },
    toObject: { virtuals: true, versionKey: false, transform: stripId },
  },
);

function stripId(_doc, ret) { delete ret._id; return ret; }

interviewSchema.virtual('id').get(function id() { return this._id?.toHexString(); });

// History-feed index.
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, domainSlug: 1, createdAt: -1 });

export default mongoose.model('Interview', interviewSchema);
