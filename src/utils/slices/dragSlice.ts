import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DragState } from "./types";
import { DragRenderLayers } from "../enums/items";

export const initialState: DragState = {
  initialPosition: { x: 0, y: 0 },
  nodes: {},
  layers: {
    [DragRenderLayers.BOTTOM]: [],
    [DragRenderLayers.TOP]: [],
  },
  types: [],
};

const dragSlice = createSlice({
  name: "drag",
  initialState,
  reducers: {
    setDragData: (state, action: PayloadAction<DragState>) => {
      const { initialPosition, nodes, layers, types } = action.payload;
      if (!initialPosition || !layers || !types) return;
      return { initialPosition, nodes, layers, types };
    },
    clearDragData: () => {
      return {
        initialPosition: { x: 0, y: 0 },
        nodes: {},
        layers: {
          [DragRenderLayers.BOTTOM]: [],
          [DragRenderLayers.TOP]: [],
        },
        types: [],
      };
    },
  },
});

export const { setDragData, clearDragData } = dragSlice.actions;

export default dragSlice.reducer;
