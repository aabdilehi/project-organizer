import { createSlice } from "@reduxjs/toolkit";
import { Binary } from "bson";
import { ImageDataState } from "./types";

export const initialState: ImageDataState = {};

const imageDataSlice = createSlice({
  name: "imageData",
  initialState,
  reducers: {
    setImages: (state, action) => {
      const images: { [id: string]: Binary } = action.payload;
      return images;
    },
    clearImages: (state, action) => {
      const deleteIds: string[] = action.payload;

      if (!Array.isArray(deleteIds)) return; // If payload is not array, just exit out for safety
      if (deleteIds.length <= 0) return {}; // If payload is specifically an empty array, then empty the state

      deleteIds.forEach((id) => delete state[id]); // Otherwise, delete only those mentioned in payload
    },
    removeImage: (state, action) => {
      const { id }: { id: string } = action.payload;
      delete state[id];
    },
    addImage: (state, action) => {
      const { id, image }: { id: string; image: Binary } = action.payload;
      return {
        ...state,
        [id]: image,
      };
    },
  },
});

export const { addImage, removeImage, setImages, clearImages } =
  imageDataSlice.actions;

export default imageDataSlice.reducer;
