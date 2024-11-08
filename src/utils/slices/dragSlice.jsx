import { createSlice } from "@reduxjs/toolkit";
const dragSlice = createSlice({
  name: "drag",
  initialState: {
    initialPosition: { x: 0, y: 0 },
    nodes: {},
  },
  reducers: {
    setDragData: (state, action) => {
      const { initialPosition, nodes } = action.payload;
      if (!initialPosition || !nodes) return;
      return { initialPosition, nodes };
    },
    clearDragData: () => {
      return {
        initialPosition: { x: 0, y: 0 },
        nodes: {},
      };
    },
  },
});

export const { setDragData, clearDragData } = dragSlice.actions;

export default dragSlice.reducer;
