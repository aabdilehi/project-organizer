import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { pictureSchema } from "../schema";

const pictureSlice = createSlice({
  name: "pictures",
  initialState: {},
  reducers: {
    addPicture: (state, action) => {
      const normalizedData = normalize(action.payload, pictureSchema);
      const { entities } = normalizedData;
      console.log(action.payload);
      return {
        ...state,
        ...entities.pictures,
      };
    },
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
    updatePosition: (state, action) => {
      const { pictureId, pX, pY } = action.payload;
      const picture = state[pictureId];
      return {
        ...state,
        [pictureId]: {
          ...picture,
          pX,
          pY,
        },
      };
    },
    updateSize: (state, action) => {
      const { pictureId, sX, sY } = action.payload;
      const picture = state[pictureId];
      return {
        ...state,
        [pictureId]: {
          ...picture,
          sX,
          sY,
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
    updateParent: (state, action) => {
      const { pictureId, newParentId, newParentType } = action.payload;
      console.log(newParentType);
      const picture = state[pictureId];
      return {
        ...state,
        [pictureId]: {
          ...picture,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
    removePicture: (state, action) => {
      const { pictureId } = action.payload;
      delete state[pictureId];
    },
  },
});

export const {
  addPicture,
  updateImage,
  updateLabel,
  updatePosition: updatePicturePosition,
  updateSize,
  updateParent: updatePictureParent,
  updateLabelVisibility,
  removePicture,
} = pictureSlice.actions;

export default pictureSlice.reducer;
