import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updateContent,
  updateParent,
  updatePosition,
  updateSize,
} from "./nodeActions";

const noteSlice = createSlice({
  name: "notes",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addNode.action, addNode.reducer("note"));
    builder.addCase(updateContent.action, updateContent.reducer("note"));
    builder.addCase(updatePosition.action, updatePosition.reducer("note"));
    builder.addCase(updateSize.action, updateSize.reducer("note"));
    builder.addCase(updateParent.action, updateParent.reducer("note"));
    builder.addCase(removeNode.action, removeNode.reducer("note"));
  },
});

export default noteSlice.reducer;
