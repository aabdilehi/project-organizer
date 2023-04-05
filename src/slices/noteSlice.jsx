import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { noteSchema } from "../schema";

const noteSlice = createSlice({
  name: "notes",
  initialState: {},
  reducers: {
    addNote: (state, action) => {
      const normalizedData = normalize(action.payload, noteSchema);
      const { entities } = normalizedData;
      return {
        ...state,
        ...entities.notes,
      };
    },
    updateText: (state, action) => {
      const { noteId, text } = action.payload;
      const note = state[noteId];
      return {
        ...state,
        [noteId]: {
          ...note,
          text,
        },
      };
    },
    updatePosition: (state, action) => {
      const { noteId, pX, pY } = action.payload;
      const note = state[noteId];
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
      return {
        ...state,
        [noteId]: {
          ...note,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
  },
});

export const {
  addNote,
  updateText,
  updatePosition: updateNotePosition,
  updateSize,
  updateParent: updateNoteParent,
} = noteSlice.actions;

export default noteSlice.reducer;
