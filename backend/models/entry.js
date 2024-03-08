import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  //userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  entryTitle: { type: String, required: true },
  generalPermission: { type: String, required: true },
  dateGenerated: { type: Date, required: true },
  qrCode: { type: String, required: true },
  subEntriesCount: { type: Number, required: true },
});

mongoose.model("Entry", EntrySchema);