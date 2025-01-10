import { createSlice } from "@reduxjs/toolkit";
import {
  addChild,
  addNode,
  offsetPosition,
  removeChild,
  removeNode,
  updateParent,
  updatePosition,
  updateSize,
  updateTitle,
} from "./nodeActions";

const columnSlice = createSlice({
  name: "columns",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addNode.action, addNode.reducer("column"));
    builder.addCase(removeNode.action, removeNode.reducer("column"));
    builder.addCase(addChild.action, addChild.reducer("column"));
    builder.addCase(removeChild.action, removeChild.reducer("column"));
    builder.addCase(updateTitle.action, updateTitle.reducer("column"));
    builder.addCase(updatePosition.action, updatePosition.reducer("column"));
    builder.addCase(offsetPosition.action, offsetPosition.reducer("column"));
    builder.addCase(updateSize.action, updateSize.reducer("column"));
    builder.addCase(updateParent.action, updateParent.reducer("column"));
  },
});

export default columnSlice.reducer;
