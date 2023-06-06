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
  const node = Object.values(req.body)[0];
  console.log(node);
  let newNode;
  switch (node.type) {
    case BoardObjects.BOARD:
      newNode = await Board.create({
        pubId: node.pubId,
        title: node.title,
        position: { x: node.pX, y: node.pY },
        children: node.children,
        parent: node.parent,
      });
      break;
    case BoardObjects.NOTE:
      newNode = await Note.create({
        pubId: node.pubId,
        content: node.content,
        position: { x: node.pX, y: node.pY },
        size: { x: node.sX, y: node.sY },
        parent: node.parent,
      });
      break;
    case BoardObjects.DOCUMENT:
      newNode = await Document.create({
        pubId: node.pubId,
        title: node.title,
        content: node.content,
        position: { x: node.pX, y: node.pY },
        parent: node.parent,
      });
      break;
    case BoardObjects.IMAGE:
      newNode = await Picture.create({
        pubId: node.pubId,
        image: node.image,
        label: node.label,
        position: { x: node.pX, y: node.pY },
        size: { x: node.sX, y: node.sY },
        parent: node.parent,
      });
      break;
    case BoardObjects.COLUMN:
      newNode = await Column.create({
        pubId: node.pubId,
        title: node.title,
        position: { x: node.pX, y: node.pY },
        size: { x: node.sX },
        children: node.children,
        parent: node.parent,
      });
      break;
  }
  newNode.save();
  res.status(200).json(newNode);
};
