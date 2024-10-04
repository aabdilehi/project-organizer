import { createSlice } from "@reduxjs/toolkit";
const dragSlice = createSlice({
  name: "drag",
  initialState: {},
  reducers: {
    setDraggedNodes: (state, action) => {
      const data = action.payload;
      if (!data) return;
      return data;
    },
    clearDraggedNodes: () => {
      return {};
    },
  },
});

export const { setDraggedNodes, clearDraggedNodes } = dragSlice.actions;

export default dragSlice.reducer;
