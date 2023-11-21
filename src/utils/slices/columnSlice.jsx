import { createSlice } from "@reduxjs/toolkit";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
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
    builder.addCase(updateSize.action, updateSize.reducer("column"));
  },
});

export default columnSlice.reducer;
