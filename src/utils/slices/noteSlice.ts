import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  offsetPosition,
  removeNode,
  setSliceData,
  updateContent,
  updateParent,
  updatePosition,
  updateSize,
} from "./nodeActions";
import { NoteState } from "./types";

export const initialState: NoteState = {};
const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setSliceData.action, setSliceData.reducer("notes"));
    builder.addCase(addNode.action, addNode.reducer("notes"));
    builder.addCase(updateContent.action, updateContent.reducer("notes"));
    builder.addCase(updatePosition.action, updatePosition.reducer("notes"));
    builder.addCase(offsetPosition.action, offsetPosition.reducer("notes"));
    builder.addCase(updateSize.action, updateSize.reducer("notes"));
    builder.addCase(updateParent.action, updateParent.reducer("notes"));
    builder.addCase(removeNode.action, removeNode.reducer("notes"));
  },
});

export default noteSlice.reducer;
