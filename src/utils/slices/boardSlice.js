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
} from "./nodeActions";

const boardSlice = createSlice({
  name: "boards",
  initialState: {
    root: {
      id: "root",
      title: "Home",
      offset: { x: 0, y: 0 },
      scale: 1,
      childRefs: [],
    },
  },
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
    builder.addCase(addNode.action, addNode.reducer("board"));
    builder.addCase(removeNode.action, removeNode.reducer("board"));
    builder.addCase(addChild.action, addChild.reducer("board"));
    builder.addCase(removeChild.action, removeChild.reducer("board"));
    builder.addCase(updateTitle.action, updateTitle.reducer("board"));
    builder.addCase(updatePosition.action, updatePosition.reducer("board"));
    builder.addCase(updateSize.action, updateSize.reducer("board")); // Used for data purposes, not rendering
    builder.addCase(updateParent.action, updateParent.reducer("board"));
  },
});

export const { updateOffset, updateScale } = boardSlice.actions;

export default boardSlice.reducer;
