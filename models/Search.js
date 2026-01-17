import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
    },
    platforms: {
      type: [String],
      default: [],
    },
    geminiResult: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Search = mongoose.model('Search', searchSchema);

export default Search;
