import { createSlice } from "@reduxjs/toolkit";
const selectionSlice = createSlice({
  name: "selection",
  initialState: {},
  reducers: {
    selectNode: (state, action) => {
      const { id, type } = action.payload;
      if (!id) return;
      return {
        [id]: type,
      };
    },
    setSelectedNodes: (state, action) => {
      const { ...nodes } = action.payload;
      return nodes;
    },
    addSelectNode: (state, action) => {
      const { id, type } = action.payload;
      if (!id) return;
      return {
        ...state,
        [id]: type,
      };
    },
    toggleSelectNode: (state, action) => {
      const { id, type } = action.payload;
      if (!id) return;
      if (!!state[id]) {
        delete state[id];
      } else {
        return {
          ...state,
          [id]: type,
        };
      }
    },
    clearSelectNode: () => {
      return {};
    },
  },
});

export const {
  selectNode,
  setSelectedNodes,
  addSelectNode,
  toggleSelectNode,
  clearSelectNode,
} = selectionSlice.actions;

export default selectionSlice.reducer;
