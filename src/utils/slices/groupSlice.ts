import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  setSliceData,
  updateParent,
  updatePosition,
  updateSize,
  updateTitle,
} from "./nodeActions";
import { GroupState } from "./types";

export const initialState: GroupState = {};

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setSliceData.action, setSliceData.reducer("groups"));
    builder.addCase(addNode.action, addNode.reducer("groups"));
    builder.addCase(updateTitle.action, updateTitle.reducer("groups"));
    builder.addCase(updatePosition.action, updatePosition.reducer("groups"));
    builder.addCase(updateSize.action, updateSize.reducer("groups"));
    builder.addCase(updateParent.action, updateParent.reducer("groups"));
    builder.addCase(removeNode.action, removeNode.reducer("groups"));
  },
});

export default groupSlice.reducer;
