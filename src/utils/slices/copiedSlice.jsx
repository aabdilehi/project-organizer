import { createSlice } from "@reduxjs/toolkit";
const copiedSlice = createSlice({
  name: "copied",
  initialState: [],
  reducers: {
    copyNodeData: (state, action) => {
      const data = action.payload;
      if (!data) return;
      return [...data];
    },
    clearCopiedNodes: () => {
      return [];
    },
    addCopyNode: (state, action) => {
      const data = action.payload;
      if (!data) return;
      // // check if node already exists in state
      const nodeIndex = state.findIndex((item) => item.id === data.id);

      // // if it is then update
      if (nodeIndex !== -1)
        return [
          ...state.slice(0, nodeIndex),
          data,
          ...state.slice(nodeIndex + 1),
        ];

      // if node is already in state then skip
      //if (!!state.find((item) => item.id === data.id)) return;

      return [...state, data];
    },
  },
});

export const { copyNodeData, clearCopiedNodes, addCopyNode } =
  copiedSlice.actions;

export default copiedSlice.reducer;
