import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  pubId: { type: String, required: true },
  title: String,
  content: String,
  position: { x: Number, y: Number },
  parent: {
    id: { type: String, required: true },
    type: { type: String, required: true },
  },
});
try {
  module.exports = mongoose.model("Document");
} catch (e) {
  module.exports = mongoose.model("Document", documentSchema);
}
