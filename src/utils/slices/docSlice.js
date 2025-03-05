import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updatePosition,
  updateSize,
  updateParent,
  updateContent,
  updateTitle,
  setSliceData,
} from "./nodeActions";
import { BoardObjects } from "../enums/items";

const docSlice = createSlice({
  name: "documents",
  initialState: {},
  reducers: {
    toggleExpanded: (state, action) => {
      const { documentId, expanded } = action.payload;
      const document = state[documentId];
      return {
        ...state,
        [documentId]: {
          ...document,
          expanded,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      setSliceData.action,
      setSliceData.reducer(BoardObjects.DOCUMENT)
    );
    builder.addCase(addNode.action, addNode.reducer(BoardObjects.DOCUMENT));
    builder.addCase(
      removeNode.action,
      removeNode.reducer(BoardObjects.DOCUMENT)
    );
    builder.addCase(
      updateTitle.action,
      updateTitle.reducer(BoardObjects.DOCUMENT)
    );
    builder.addCase(
      updateContent.action,
      updateContent.reducer(BoardObjects.DOCUMENT)
    );
    builder.addCase(
      updatePosition.action,
      updatePosition.reducer(BoardObjects.DOCUMENT)
    );
    builder.addCase(
      updateSize.action,
      updateSize.reducer(BoardObjects.DOCUMENT)
    ); // Used for data purposes, not rendering
    builder.addCase(
      updateParent.action,
      updateParent.reducer(BoardObjects.DOCUMENT)
    );
  },
});

export const { toggleExpanded } = docSlice.actions;

export default docSlice.reducer;
