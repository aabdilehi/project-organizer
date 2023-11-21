import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  addChild,
  removeChild,
  updatePosition,
  removeNode,
  updateTitle,
} from "./nodeActions";

const boardSlice = createSlice({
  name: "boards",
  initialState: {
    root: {
      id: "root",
      title: "Home",
      childRefs: [],
    },
  },
  reducers: {
    // Can probably merge board and board version of this function
    // Will need to move it out of both
  },
  extraReducers: (builder) => {
    builder.addCase(addNode.action, addNode.reducer("board"));
    builder.addCase(removeNode.action, removeNode.reducer("board"));
    builder.addCase(addChild.action, addChild.reducer("board"));
    builder.addCase(removeChild.action, removeChild.reducer("board"));
    builder.addCase(updateTitle.action, updateTitle.reducer("board"));
    builder.addCase(updatePosition.action, updatePosition.reducer("board"));
  },
});

export default boardSlice.reducer;
