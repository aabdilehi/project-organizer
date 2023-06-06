import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { noteSchema } from "../../schema";
import { BoardObjects } from "../enums/items";

const noteSlice = createSlice({
  name: "notes",
  initialState: {},
  reducers: {
    getNotes: (state, action) => {
      const notes = action.payload;
      return notes;
    },
    addNote: (state, action) => {
      const normalizedData = normalize(action.payload, noteSchema);
      const { entities } = normalizedData;
      fetch("/api/create-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entities.notes),
      }).then((response) => response.json());
      return {
        ...state,
        ...entities.notes,
      };
    },
    updateContent: (state, action) => {
      const { noteId, content } = action.payload;
      const note = state[noteId];
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.NOTE,
          query: { pubId: noteId },
          update: {
            content,
          },
        }),
      }).then((response) => response.json());
      return {
        ...state,
        [noteId]: {
          ...note,
          content,
        },
      };
    },
    updatePosition: (state, action) => {
      const { noteId, pX, pY } = action.payload;
      const note = state[noteId];
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.NOTE,
          query: { pubId: noteId },
          update: {
            position: { x: pX, y: pY },
          },
        }),
      }).then((response) => response.json());
      return {
        ...state,
        [noteId]: {
          ...note,
          pX,
          pY,
        },
      };
    },
    updateSize: (state, action) => {
      const { noteId, sX, sY } = action.payload;
      const note = state[noteId];
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.NOTE,
          query: { pubId: noteId },
          update: {
            size: { x: sX, y: sY },
          },
        }),
      }).then((response) => response.json());
      return {
        ...state,
        [noteId]: {
          ...note,
          sX,
          sY,
        },
      };
    },
    updateParent: (state, action) => {
      const { noteId, newParentId, newParentType } = action.payload;
      console.log(newParentType);
      const note = state[noteId];
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.NOTE,
          query: { pubId: noteId },
          update: {
            parent: { id: newParentId, type: newParentType },
          },
        }),
      }).then((response) => response.json());
      return {
        ...state,
        [noteId]: {
          ...note,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
    removeNote: (state, action) => {
      const { noteId } = action.payload;
      fetch("/api/delete-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.NOTE,
          query: { pubId: noteId },
        }),
      }).then((response) => response.json());
      delete state[noteId];
    },
  },
});

export const {
  getNotes,
  addNote,
  updateContent,
  updatePosition: updateNotePosition,
  updateSize,
  updateParent: updateNoteParent,
  removeNote,
} = noteSlice.actions;

export default noteSlice.reducer;
