import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updatePosition,
  updateSize,
  updateParent,
  offsetPosition,
} from "./nodeActions";

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
    builder.addCase(addNode.action, addNode.reducer("image"));
    builder.addCase(removeNode.action, removeNode.reducer("image"));
    builder.addCase(updatePosition.action, updatePosition.reducer("image"));
    builder.addCase(offsetPosition.action, offsetPosition.reducer("image"));
    builder.addCase(updateSize.action, updateSize.reducer("image"));
    builder.addCase(updateParent.action, updateParent.reducer("image"));
  },
});

export const { updateImage, updateLabel, updateLabelVisibility } =
  pictureSlice.actions;

export default pictureSlice.reducer;
