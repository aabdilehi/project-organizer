import { createSlice } from "@reduxjs/toolkit";
const dragSlice = createSlice({
  name: "drag",
  initialState: {},
  reducers: {
    setDragData: (state, action) => {
      const { type, data } = action.payload;
      if (!type || !data) return;
      return {
        type,
        data,
      };
    },
    clearDragData: () => {
      return {};
    },
  },
});

export const { setDragData, clearDragData } = dragSlice.actions;

export default dragSlice.reducer;
