import mongoose from "mongoose";
const Board = require("@/utils/models/board");
const Column = require("@/utils/models/column");
const Note = require("@/utils/models/note");
import { BoardObjects } from "@/utils/enums/items";

const connection = {};

async function connectToDatabase() {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  const db = await mongoose.connect(
    /* Use this for production: process.env.MONGODB_URI*/ "mongodb+srv://abokor115:KVmyqltc8uzN0CaD@cluster0.knnnak4.mongodb.net/projorg?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  connection.isConnected = db.connections[0].readyState;
  console.log("Connected to database");
}

function getChildNodes(arr) {
  const aaa = arr.map(async (item, index) => {
    switch (item.type) {
      case BoardObjects.BOARD:
        return await Board.where(
          { _id: new mongooose.Types.ObjectId(item.id) }.findOne()
        );
      case BoardObjects.COLUMN:
        const column = await Column.where(
          { _id: new mongooose.Types.ObjectId(item.id) }.findOne()
        );
        const columnChildren = await getChildNodes(column.childRefs);
        return [column, ...columnChildren];
      case BoardObjects.NOTE:
        return await Note.where(
          { _id: new mongooose.Types.ObjectId(item.id) }.findOne()
        );
    }
  });
  return aaa;
}

export default async (req, res) => {
  await connectToDatabase();
  // id and type should be the payload
  // do switch statement on the type
  // for board and column get top level children
  // or have separate api route for getting containers

  const id = req.query; //
  console.log(id);
  const board = await Board.where({
    _id: new mongoose.Types.ObjectId(id),
  }).findOne();
  // res.status(200).json(board);
  // // do check for board?
  // const children = await getChildNodes(board.children);
  res.status(200).json({ board });
};
