import mongoose from "mongoose";

const pictureSchema = new mongoose.Schema({
  pubId: { type: String, required: true },
  position: { x: Number, y: Number },
  size: { x: Number, y: Number },
  image: String,
  label: String,
  parent: {
    id: { type: String, required: true },
    type: { type: String, required: true },
  },
});
try {
  module.exports = mongoose.model("Picture");
} catch (e) {
  module.exports = mongoose.model("Picture", pictureSchema);
}
