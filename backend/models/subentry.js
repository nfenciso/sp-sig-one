import mongoose from 'mongoose';

const SubentrySchema = new mongoose.Schema({
  entryId: { type: String, required: true },
  subentryTitle: { type: String, required: true },
  specificPermission: { type: String, required: true },
  type: { type: String, required: true },
  content:  { type: String, required: true }
});

mongoose.model("Subentry", SubentrySchema);