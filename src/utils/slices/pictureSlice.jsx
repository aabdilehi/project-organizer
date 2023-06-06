import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { pictureSchema } from "../../schema";
import { BoardObjects } from "../enums/items";

const pictureSlice = createSlice({
  name: "pictures",
  initialState: {},
  reducers: {
    getPictures: (state, action) => {
      const pictures = action.payload;
      return pictures;
    },
    addPicture: (state, action) => {
      const normalizedData = normalize(action.payload, pictureSchema);
      const { entities } = normalizedData;
      fetch("/api/create-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entities.pictures),
      }).then((response) => response.json());
      console.log(action.payload);
      return {
        ...state,
        ...entities.pictures,
      };
    },
    updateLabel: (state, action) => {
      const { pictureId, label } = action.payload;
      const picture = state[pictureId];
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.IMAGE,
          query: { pubId: pictureId },
          update: {
            label,
          },
        }),
      }).then((response) => response.json());
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
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.IMAGE,
          query: { pubId: pictureId },
          update: {
            position: { x: pX, y: pY },
          },
        }),
      }).then((response) => response.json());
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
      fetch("/api/update-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: BoardObjects.IMAGE,
          query: { pubId: pictureId },
          update: {
            size: { x: sX, y: sY },
          },
        }),
      }).then((response) => response.json());
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
      const { pictureId, file } = action.payload;
      const form = new FormData();
      form.append("image", file);
      fetch("/api/upload-image", {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          fetch("/api/update-node", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: BoardObjects.IMAGE,
              query: { pubId: pictureId },
              update: {
                image: data,
              },
            }),
          }).then((response) => response.json());
        });
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
  getPictures,
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
