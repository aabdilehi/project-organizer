import mongoose from "mongoose";
const Board = require("@/utils/models/board");
const Column = require("@/utils/models/column");
const Note = require("@/utils/models/note");
const Document = require("@/utils/models/document");
const Picture = require("@/utils/models/picture");
import { BoardObjects } from "@/utils/enums/items";

const connection = {};

async function connectToDatabase() {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  const db = await mongoose.connect(
    /* Use this for production: process.env.MONGODB_URI*/ "mongodb+srv://abokor115:T0gJqLDoW2edzljC@cluster0.knnnak4.mongodb.net/projorg?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  connection.isConnected = db.connections[0].readyState;
  console.log("Connected to database");
}

export default async (req, res) => {
  await connectToDatabase();
  const { type, query } = req.body;

  let updatedNode;
  switch (type) {
    case BoardObjects.BOARD:
      updatedNode = await Board.findOneAndDelete(query);
      break;
    case BoardObjects.NOTE:
      updatedNode = await Note.findOneAndDelete(query);
      break;
    case BoardObjects.DOCUMENT:
      updatedNode = await Document.findOneAndDelete(query);
      break;
    case BoardObjects.IMAGE:
      updatedNode = await Picture.findOneAndDelete(query);
      break;
    case BoardObjects.COLUMN:
      updatedNode = await Column.findOneAndDelete(query);
      break;
    default:
      res.status(400);
      return;
  }
  res.status(200).json(updatedNode);
};
