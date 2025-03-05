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
import { BoardObjects } from "../enums/items";

const noteSlice = createSlice({
  name: "notes",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      setSliceData.action,
      setSliceData.reducer(BoardObjects.NOTE)
    );
    builder.addCase(addNode.action, addNode.reducer(BoardObjects.NOTE));
    builder.addCase(
      updateContent.action,
      updateContent.reducer(BoardObjects.NOTE)
    );
    builder.addCase(
      updatePosition.action,
      updatePosition.reducer(BoardObjects.NOTE)
    );
    builder.addCase(
      offsetPosition.action,
      offsetPosition.reducer(BoardObjects.NOTE)
    );
    builder.addCase(updateSize.action, updateSize.reducer(BoardObjects.NOTE));
    builder.addCase(
      updateParent.action,
      updateParent.reducer(BoardObjects.NOTE)
    );
    builder.addCase(removeNode.action, removeNode.reducer(BoardObjects.NOTE));
  },
});

export default noteSlice.reducer;
