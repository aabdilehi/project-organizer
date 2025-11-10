import { createSlice } from "@reduxjs/toolkit";
import { DragState } from "./types";

export const initialState: DragState = {
  initialPosition: { x: 0, y: 0 },
  nodes: {},
  types: [],
};

const dragSlice = createSlice({
  name: "drag",
  initialState,
  reducers: {
    setDragData: (state, action) => {
      const { initialPosition, nodes, types } = action.payload;
      if (!initialPosition || !nodes || !types) return;
      return { initialPosition, nodes, types };
    },
    clearDragData: () => {
      return {
        initialPosition: { x: 0, y: 0 },
        nodes: {},
        types: [],
      };
    },
  },
});

export const { setDragData, clearDragData } = dragSlice.actions;

export default dragSlice.reducer;
