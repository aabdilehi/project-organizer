import { createSlice } from "@reduxjs/toolkit";
import { BoardObjects } from "../enums/items";
import { BoardType, RootBoardType } from "../classes/new-classes";
import {
  setSliceData,
  addNode,
  removeNode,
  addChild,
  removeChild,
  updateTitle,
  updatePosition,
  updateSize,
  updateParent,
} from "./nodeActions";
import { BoardState } from "./types";

export const initialState: BoardState = {
  root: {
    id: "root",
    title: "Home",
    type: BoardObjects.BOARD,
    offset: { x: 0, y: 0 },
    scale: 1,
    childRefs: [],
  },
};

const name = "boards";

const boardSlice = createSlice({
  name,
  initialState,
  reducers: {
    // Can probably merge board and board version of this function
    // Will need to move it out of both
    updateOffset: (state, action) => {
      const { id, x, y } = action.payload;
      const board = state[id];
      if (!board || x == null || y == null) return;
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
    builder.addCase(setSliceData.action, setSliceData.reducer("boards"));
    builder.addCase(addNode.action, addNode.reducer("boards"));
    builder.addCase(removeNode.action, removeNode.reducer("boards"));
    builder.addCase(addChild.action, addChild.reducer("boards"));
    builder.addCase(removeChild.action, removeChild.reducer("boards"));
    builder.addCase(updateTitle.action, updateTitle.reducer("boards"));
    builder.addCase(updatePosition.action, updatePosition.reducer("boards"));
    builder.addCase(updateSize.action, updateSize.reducer("boards")); // Used for data purposes, not rendering
    builder.addCase(updateParent.action, updateParent.reducer("boards"));
  },
});

export const { updateOffset, updateScale } = boardSlice.actions;

export default boardSlice.reducer;
