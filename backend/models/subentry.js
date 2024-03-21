import mongoose from 'mongoose';

const SubentrySchema = new mongoose.Schema({
  entryId: { type: String, required: true },
  index: { type: Number, required: true },
  subentryTitle: { type: String, required: true },
  specificPermission: { type: Array, required: true },
  type: { type: String, required: true },
  content:  { type: String, required: true }
});

mongoose.model("Subentry", SubentrySchema);