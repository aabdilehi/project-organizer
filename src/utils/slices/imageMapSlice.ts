import { createSlice } from "@reduxjs/toolkit";

const initialState: { [id: string]: string } = {};
const imageMapSlice = createSlice({
  name: "imageMap",
  initialState,
  reducers: {
    setImageUrls: (state, action) => {
      const images: { [id: string]: string } = action.payload;
      return images;
    },
    clearImageUrls: (state) => {
      Object.values(state).forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
      return {};
    },
    removeImageUrls: (state, action) => {
      const { id }: { id: string } = action.payload;
      delete state[id];
    },
    addImageUrl: (state, action) => {
      const { id, image }: { id: string; image: string } = action.payload;
      return {
        ...state,
        [id]: image,
      };
    },
  },
});

export const { addImageUrl, removeImageUrls, setImageUrls, clearImageUrls } =
  imageMapSlice.actions;

export default imageMapSlice.reducer;
