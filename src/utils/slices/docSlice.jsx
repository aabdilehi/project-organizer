import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { docSchema } from "../../schema";
import { BoardObjects } from "../enums/items";

const docSlice = createSlice({
  name: "documents",
  initialState: {},
  reducers: {
    getDocuments: (state, action) => {
      const documents = action.payload;
      return documents;
    },
    addDocument: (state, action) => {
      const normalizedData = normalize(action.payload, docSchema);
      const { entities } = normalizedData;
      fetch("/api/create-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entities.documents),
      }).then((response) => response.json());
      return {
        ...state,
        ...entities.documents,
      };
    },
    updateContent: (state, action) => {
      const { documentId, content } = action.payload;
      const document = state[documentId];
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.DOCUMENT,
          query: { pubId: documentId },
          update: {
            content,
          },
        }),
      }).then((response) => response.json());
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
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.DOCUMENT,
          query: { pubId: documentId },
          update: {
            title,
          },
        }),
      }).then((response) => response.json());
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
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.DOCUMENT,
          query: { pubId: documentId },
          update: {
            position: { x: pX, y: pY },
          },
        }),
      }).then((response) => response.json());
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
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.DOCUMENT,
          query: { pubId: documentId },
          update: {
            parent: { id: newParentId, type: newParentType },
          },
        }),
      }).then((response) => response.json());
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
  getDocuments,
  addDocument,
  updateContent,
  updateTitle,
  updatePosition: updateDocumentPosition,
  toggleExpanded,
  updateParent: updateDocumentParent,
  removeDocument,
} = docSlice.actions;

export default docSlice.reducer;
