import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
  pubId: { type: String, required: true },
  title: String,
  position: { x: Number, y: Number },
  size: { x: Number }, // Can only change width
  parent: {
    id: { type: String, required: true },
    type: { type: String, required: true },
  },
  children: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
});
try {
  module.exports = mongoose.model("Column");
} catch (e) {
  module.exports = mongoose.model("Column", columnSchema);
}
