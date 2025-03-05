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
import { BoardObjects } from "../enums/items";

const groupSlice = createSlice({
  name: "groups",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      setSliceData.action,
      setSliceData.reducer(BoardObjects.GROUP)
    );
    builder.addCase(addNode.action, addNode.reducer(BoardObjects.GROUP));
    builder.addCase(
      updateTitle.action,
      updateTitle.reducer(BoardObjects.GROUP)
    );
    builder.addCase(
      updatePosition.action,
      updatePosition.reducer(BoardObjects.GROUP)
    );
    builder.addCase(updateSize.action, updateSize.reducer(BoardObjects.GROUP));
    builder.addCase(
      updateParent.action,
      updateParent.reducer(BoardObjects.GROUP)
    );
    builder.addCase(removeNode.action, removeNode.reducer(BoardObjects.GROUP));
  },
});

export default groupSlice.reducer;
