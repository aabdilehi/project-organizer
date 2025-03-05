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

const pictureSlice = createSlice({
  name: "pictures",
  initialState: {},
  reducers: {
    updateLabel: (state, action) => {
      const { pictureId, label } = action.payload;
      const picture = state[pictureId];
      return {
        ...state,
        [pictureId]: {
          ...picture,
          label,
        },
      };
    },
    updateLabelVisibility: (state, action) => {
      const { pictureId, showLabel } = action.payload;
      const picture = state[pictureId];
      return {
        ...state,
        [pictureId]: {
          ...picture,
          showLabel,
        },
      };
    },
    updateImage: (state, action) => {
      const { pictureId, image } = action.payload;
      const picture = state[pictureId];
      return {
        ...state,
        [pictureId]: {
          ...picture,
          image,
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
  pictureSlice.actions;

export default pictureSlice.reducer;
