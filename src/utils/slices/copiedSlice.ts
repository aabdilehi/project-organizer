import { createSlice } from "@reduxjs/toolkit";
import { CopiedState } from "./types";

export const initialState: CopiedState = {
  position: { x: 0, y: 0 },
  nodes: [],
};

const copiedSlice = createSlice({
  name: "copied",
  initialState,
  reducers: {
    copyNodeData: (state, action) => {
      const nodes = action.payload;
      if (!nodes) return;

      return {
        ...state,
        nodes,
      };
    },
    clearCopiedNodes: (state, action) => {
      return { position: { x: 0, y: 0 }, centroid: { x: 0, y: 0 }, nodes: [] };
    },
    setPosition: (state, action) => {
      // only want to do this once at the beginning
      const { x, y } = action.payload;
      if (!x || !y) return;
      return { ...state, position: { x, y } };
    },
    addCopyNode: (state, action) => {
      const node = action.payload;
      if (!node) return;
      // // check if node already exists in state
      const nodeIndex = state.nodes.findIndex((item) => item.id === node.id);

      // // if it is then update
      if (nodeIndex !== -1) {
        return {
          ...state,
          nodes: [
            ...state.nodes.slice(0, nodeIndex),
            node,
            ...state.nodes.slice(nodeIndex + 1),
          ],
        };
      }

      // if node is already in state then skip
      //if (!!state.find((item) => item.id === data.id)) return;

      return { ...state, nodes: [...state.nodes, node] };
    },
  },
});

export const { copyNodeData, clearCopiedNodes, setPosition, addCopyNode } =
  copiedSlice.actions;

export default copiedSlice.reducer;
