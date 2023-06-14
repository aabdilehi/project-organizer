import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { docSchema } from "../schema";

const docSlice = createSlice({
  name: "documents",
  initialState: {},
  reducers: {
    addDocument: (state, action) => {
      const normalizedData = normalize(action.payload, docSchema);
      const { entities } = normalizedData;
      return {
        ...state,
        ...entities.documents,
      };
    },
    updateContent: (state, action) => {
      const { documentId, content } = action.payload;
      const document = state[documentId];
      return {
        ...state,
        [documentId]: {
          ...document,
          content,
        },
      };
    },
    updateTitle: (state, action) => {
      const { documentId, title } = action.payload;
      const document = state[documentId];
      return {
        ...state,
        [documentId]: {
          ...document,
          title,
        },
      };
    },
    updatePosition: (state, action) => {
      const { documentId, pX, pY } = action.payload;
      const document = state[documentId];
      return {
        ...state,
        [documentId]: {
          ...document,
          pX,
          pY,
        },
      };
    },
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
    updateParent: (state, action) => {
      const { documentId, newParentId, newParentType } = action.payload;
      console.log(newParentType);
      const document = state[documentId];
      return {
        ...state,
        [documentId]: {
          ...document,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
    removeDocument: (state, action) => {
      const { documentId } = action.payload;
      delete state[documentId];
    },
  },
});

export const {
  addDocument,
  updateContent,
  updateTitle,
  updatePosition: updateDocumentPosition,
  toggleExpanded,
  updateParent: updateDocumentParent,
  removeDocument,
} = docSlice.actions;

export default docSlice.reducer;
