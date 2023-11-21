import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updatePosition,
  updateSize,
  updateContent,
  updateTitle,
} from "./nodeActions";

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
    builder.addCase(addNode.action, addNode.reducer("document"));
    builder.addCase(removeNode.action, removeNode.reducer("document"));
    builder.addCase(updateTitle.action, updateTitle.reducer("document"));
    builder.addCase(updateContent.action, updateContent.reducer("document"));
    builder.addCase(updatePosition.action, updatePosition.reducer("document"));
    builder.addCase(updateSize.action, updateSize.reducer("document"));
  },
});

export const { toggleExpanded } = docSlice.actions;

export default docSlice.reducer;
