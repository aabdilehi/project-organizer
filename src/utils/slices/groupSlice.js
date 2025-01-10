import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updateParent,
  updatePosition,
  updateSize,
  updateTitle,
} from "./nodeActions";

const groupSlice = createSlice({
  name: "groups",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addNode.action, addNode.reducer("group"));
    builder.addCase(updateTitle.action, updateTitle.reducer("group"));
    builder.addCase(updatePosition.action, updatePosition.reducer("group"));
    builder.addCase(updateSize.action, updateSize.reducer("group"));
    builder.addCase(updateParent.action, updateParent.reducer("group"));
    builder.addCase(removeNode.action, removeNode.reducer("group"));
  },
});

export default groupSlice.reducer;
