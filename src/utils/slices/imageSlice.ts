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
import { BoardObjects } from "../enums/items";
import { Binary } from "bson";

const imageSlice = createSlice({
  name: "images",
  initialState: {},
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
    builder.addCase(
      setSliceData.action,
      setSliceData.reducer(BoardObjects.IMAGE)
    );
    builder.addCase(addNode.action, addNode.reducer(BoardObjects.IMAGE));
    builder.addCase(removeNode.action, removeNode.reducer(BoardObjects.IMAGE));
    builder.addCase(
      updatePosition.action,
      updatePosition.reducer(BoardObjects.IMAGE)
    );
    builder.addCase(
      offsetPosition.action,
      offsetPosition.reducer(BoardObjects.IMAGE)
    );
    builder.addCase(updateSize.action, updateSize.reducer(BoardObjects.IMAGE));
    builder.addCase(
      updateParent.action,
      updateParent.reducer(BoardObjects.IMAGE)
    );
  },
});

export const { updateImage, updateLabel, updateLabelVisibility } =
  imageSlice.actions;

export default imageSlice.reducer;
