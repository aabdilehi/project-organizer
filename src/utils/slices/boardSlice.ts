import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  addChild,
  removeChild,
  updatePosition,
  updateParent,
  removeNode,
  updateTitle,
  updateSize,
  setSliceData,
} from "./nodeActions";
import { BoardObjects } from "../enums/items";
import { BoardType, RootBoardType } from "../classes/new-classes";

const initialState: { [boardId: string]: BoardType | RootBoardType } = {
  root: {
    id: "root",
    title: "Home",
    offset: { x: 0, y: 0 },
    scale: 1,
    childRefs: [],
  },
};
const boardSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    // Can probably merge board and board version of this function
    // Will need to move it out of both
    updateOffset: (state, action) => {
      const { id, x, y } = action.payload;
      const board = state[id];
      if (!board || !x || !y) return;
      return {
        ...state,
        [id]: {
          ...board,
          offset: { x, y },
        },
      };
    },
    updateScale: (state, action) => {
      const { id, scale } = action.payload;
      const board = state[id];
      if (!board || !scale) return;
      return {
        ...state,
        [id]: {
          ...board,
          scale,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      setSliceData.action,
      setSliceData.reducer(BoardObjects.BOARD)
    );
    builder.addCase(addNode.action, addNode.reducer(BoardObjects.BOARD));
    builder.addCase(removeNode.action, removeNode.reducer(BoardObjects.BOARD));
    builder.addCase(addChild.action, addChild.reducer(BoardObjects.BOARD));
    builder.addCase(
      removeChild.action,
      removeChild.reducer(BoardObjects.BOARD)
    );
    builder.addCase(
      updateTitle.action,
      updateTitle.reducer(BoardObjects.BOARD)
    );
    builder.addCase(
      updatePosition.action,
      updatePosition.reducer(BoardObjects.BOARD)
    );
    builder.addCase(updateSize.action, updateSize.reducer(BoardObjects.BOARD)); // Used for data purposes, not rendering
    builder.addCase(
      updateParent.action,
      updateParent.reducer(BoardObjects.BOARD)
    );
  },
});

export const { updateOffset, updateScale } = boardSlice.actions;

export default boardSlice.reducer;
