import React, { useEffect } from "react";
import mongoose from "mongoose";
import BoardModel from "@/utils/models/board";
import ColumnModel from "@/utils/models/column";
import DocumentModel from "@/utils/models/document";
import PictureModel from "@/utils/models/picture";
const NoteModel = require("@/utils/models/note");
import { BoardObjects } from "@/utils/enums/items";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ContextMenuProvider } from "@/utils/hooks/useContextMenu";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/config/theme";
import CombinedBoard from "@/components/CombinedBoard";

export default ({ data, boardId }) => {
  return (
    <Provider store={store}>
      <ContextMenuProvider>
        <ChakraProvider theme={theme}>
          <CombinedBoard data={data} boardId={boardId} />
        </ChakraProvider>
      </ContextMenuProvider>
    </Provider>
  );
};

let data = {
  boards: {},
  notes: {},
  documents: {},
  pictures: {},
  columns: {},
};

async function getChildNode(item) {
  let queryResult;
  let mappedItem;
  switch (item.type) {
    case BoardObjects.BOARD:
      queryResult = await BoardModel.where({ pubId: item.id }).findOne();
      mappedItem = {
        pubId: queryResult.pubId,
        title: queryResult.title,
        parent: queryResult.parent,
        pX: queryResult.position.x,
        pY: queryResult.position.y,
        children: queryResult.children,
        //children: a.children, // not sure why I need this
      };
      data.boards[mappedItem.pubId] = mappedItem;
      return;
    case BoardObjects.COLUMN:
      queryResult = await ColumnModel.where({ pubId: item.id }).findOne();
      mappedItem = {
        pubId: queryResult.pubId,
        title: queryResult.title,
        parent: queryResult.parent,
        children: queryResult.children,
        pX: queryResult.position.x,
        pY: queryResult.position.y,
        sX: queryResult.size.x,
      };
      data.notes[mappedItem.pubId] = mappedItem;
      return;
    case BoardObjects.NOTE:
      queryResult = await NoteModel.where({ pubId: item.id }).findOne();
      mappedItem = {
        pubId: queryResult.pubId,
        content: queryResult.content,
        parent: queryResult.parent,
        pX: queryResult.position.x,
        pY: queryResult.position.y,
        sX: queryResult.size.x,
        sY: queryResult.size.y,
      };
      data.notes[mappedItem.pubId] = mappedItem;
      return;
    case BoardObjects.DOCUMENT:
      queryResult = await DocumentModel.where({ pubId: item.id }).findOne();
      mappedItem = {
        pubId: queryResult.pubId,
        title: queryResult.title,
        content: queryResult.content,
        parent: queryResult.parent,
        pX: queryResult.position.x,
        pY: queryResult.position.y,
      };
      data.documents[mappedItem.pubId] = mappedItem;
      return;
    case BoardObjects.IMAGE:
      queryResult = await PictureModel.where({ pubId: item.id }).findOne();
      mappedItem = {
        pubId: queryResult.pubId,
        image: queryResult.image,
        label: queryResult.label,
        parent: queryResult.parent,
        pX: queryResult.position.x,
        pY: queryResult.position.y,
        sX: queryResult.size.x,
        sY: queryResult.size.y,
      };
      data.pictures[mappedItem.pubId] = mappedItem;
      return;
  }
  // return mappedItem;
}

async function getChildNodes(arr) {
  for await (const item of arr) {
    await getChildNode(item);
  }
  console.log(data);
  return data;
}

export async function getServerSideProps(context) {
  // Connect to database
  await mongoose.connect(
    "mongodb+srv://abokor115:T0gJqLDoW2edzljC@cluster0.knnnak4.mongodb.net/projorg?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  // Reset data object
  data = {
    boards: {},
    notes: {},
    documents: {},
    pictures: {},
    columns: {},
  };

  // Get current board data
  const board = await BoardModel.where({
    pubId: context.params.boardId,
  }).findOne();

  data.boards[board.pubId] = {
    pubId: board.pubId,
    title: board.title,
    pX: board.position.x,
    pY: board.position.y,
    children: board.children,
  };

  // Get children of current board and populate data
  data = await getChildNodes(board.children);
  return {
    props: {
      data: JSON.stringify(data),
      boardId: context.params.boardId,
    },
  };
}
