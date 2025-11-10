import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updatePosition,
  updateSize,
  updateParent,
  offsetPosition,
  setSliceData,
} from "./nodeActions";
import { ImageState } from "./types";

export const initialState: ImageState = {};
const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    updateLabel: (state, action) => {
      const { id, label } = action.payload;
      const image = state[id];
      return {
        ...state,
        [id]: {
          ...image,
          label,
        },
      };
    },
    updateLabelVisibility: (state, action) => {
      const { id, showLabel } = action.payload;
      const image = state[id];
      return {
        ...state,
        [id]: {
          ...image,
          showLabel,
        },
      };
    },
    updateImage: (state, action) => {
      const { id, imageId }: { id: string; imageId: string } = action.payload;
      const imageNode = state[id];
      return {
        ...state,
        [id]: {
          ...imageNode,
          imageId,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setSliceData.action, setSliceData.reducer("images"));
    builder.addCase(addNode.action, addNode.reducer("images"));
    builder.addCase(removeNode.action, removeNode.reducer("images"));
    builder.addCase(updatePosition.action, updatePosition.reducer("images"));
    builder.addCase(offsetPosition.action, offsetPosition.reducer("images"));
    builder.addCase(updateSize.action, updateSize.reducer("images"));
    builder.addCase(updateParent.action, updateParent.reducer("images"));
  },
});

export const { updateImage, updateLabel, updateLabelVisibility } =
  imageSlice.actions;

export default imageSlice.reducer;
