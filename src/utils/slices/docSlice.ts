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
import { DocumentState } from "./types";

export const initialState: DocumentState = {};

const docSlice = createSlice({
  name: "documents",
  initialState,
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
    builder.addCase(setSliceData.action, setSliceData.reducer("documents"));
    builder.addCase(addNode.action, addNode.reducer("documents"));
    builder.addCase(removeNode.action, removeNode.reducer("documents"));
    builder.addCase(updateTitle.action, updateTitle.reducer("documents"));
    builder.addCase(updateContent.action, updateContent.reducer("documents"));
    builder.addCase(updatePosition.action, updatePosition.reducer("documents"));
    builder.addCase(updateSize.action, updateSize.reducer("documents")); // Used for data purposes, not rendering
    builder.addCase(updateParent.action, updateParent.reducer("documents"));
  },
});

export const { toggleExpanded } = docSlice.actions;

export default docSlice.reducer;
