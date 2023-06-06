import mongoose from "mongoose";
const boardSchema = new mongoose.Schema({
  pubId: { type: String, required: true },
  title: String,
  position: { x: Number, y: Number },
  parent: {
    id: { type: String, required: false },
    type: { type: String, required: false },
  },
  children: [
    {
      id: { type: String, required: false },
      type: { type: String, required: false },
    },
  ],
});
try {
  module.exports = mongoose.model("Board");
} catch (e) {
  module.exports = mongoose.model("Board", boardSchema);
}
