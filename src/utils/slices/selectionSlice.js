import { createSlice } from "@reduxjs/toolkit";
const selectionSlice = createSlice({
  name: "selection",
  initialState: {},
  reducers: {
    selectNode: (state, action) => {
      const { id, type, parent } = action.payload;
      if (!id) return;
      return {
        [id]: { id, type, parent },
      };
    },
    setSelectedNodes: (state, action) => {
      const { ...nodes } = action.payload;
      return nodes;
    },
    addSelectedNodes: (state, action) => {
      const nodes = action.payload;
      console.log(nodes);
      return { ...state, ...nodes };
    },
    addSelectNode: (state, action) => {
      // Can also be used to update the selection on data change
      const { id, type, parent } = action.payload;
      // if (!id) return;
      return {
        ...state,
        [id]: { id, type, parent },
      };
    },
    toggleSelectNode: (state, action) => {
      const { id, type, parent } = action.payload;
      if (!id) return;
      if (!!state[id]) {
        delete state[id];
      } else {
        return {
          ...state,
          [id]: { id, type, parent },
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
  addSelectedNodes,
  addSelectNode,
  toggleSelectNode,
  clearSelectNode,
} = selectionSlice.actions;

export default selectionSlice.reducer;
