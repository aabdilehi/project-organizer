import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  pubId: { type: String, required: true },
  content: String,
  position: { x: Number, y: Number },
  size: { x: Number, y: Number },
  parent: {
    id: { type: String, required: true },
    type: { type: String, required: true },
  },
});
try {
  module.exports = mongoose.model("Note");
} catch (e) {
  module.exports = mongoose.model("Note", noteSchema);
}
