import { configureStore } from "@reduxjs/toolkit";
import { $CombinedState, combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storageDB from "redux-persist-indexeddb-storage";
// import storage from "redux-persist/lib/storage";

import boardReducer from "./utils/slices/boardSlice";
import noteReducer from "./utils/slices/noteSlice";
import imageReducer from "./utils/slices/imageSlice";
import taskReducer from "./utils/slices/taskSlice";
import groupReducer from "./utils/slices/groupSlice";
import docReducer from "./utils/slices/docSlice";
import selectionReducer from "./utils/slices/selectionSlice";
import copiedReducer from "./utils/slices/copiedSlice";
import dragReducer from "./utils/slices/dragSlice";
import imageMapReducer from "./utils/slices/imageMapSlice";
import imageDataReducer from "./utils/slices/imageDataSlice";

import { generateImageUrlsThunk } from "./utils/slices/thunks";

const storage = storageDB("myDB");

let persistConfig = {
  key: "boards",
  storage,
  serialize: false,
  deserialize: false,
};
const persistedBoardReducer = persistReducer(persistConfig, boardReducer);

persistConfig = {
  key: "notes",
  storage,
  serialize: false,
  deserialize: false,
};
const persistedNoteReducer = persistReducer(persistConfig, noteReducer);

persistConfig = {
  key: "images",
  storage,
  serialize: false,
  deserialize: false,
};
const persistedImageReducer = persistReducer(persistConfig, imageReducer);

persistConfig = {
  key: "imageData",
  storage,
  serialize: false,
  deserialize: false,
};
const persistedImageDataReducer = persistReducer(
  persistConfig,
  imageDataReducer
);

persistConfig = {
  key: "tasks",
  storage,
  serialize: false,
  deserialize: false,
};
const persistedTaskReducer = persistReducer(persistConfig, taskReducer);
persistConfig = {
  key: "groups",
  storage,
  serialize: false,
  deserialize: false,
};
const persistedGroupReducer = persistReducer(persistConfig, groupReducer);
persistConfig = {
  key: "documents",
  storage,
  serialize: false,
  deserialize: false,
};
const persistedDocReducer = persistReducer(persistConfig, docReducer);

const rootReducer = combineReducers({
  boards: persistedBoardReducer,
  notes: persistedNoteReducer,
  images: persistedImageReducer,
  tasks: persistedTaskReducer,
  groups: persistedGroupReducer,
  documents: persistedDocReducer,
  selection: selectionReducer,
  copied: copiedReducer,
  drag: dragReducer,
  imageMap: imageMapReducer,
  imageData: persistedImageDataReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // initialState,
});

export type RootState = ReturnType<typeof rootReducer>;

export const persistor = persistStore(store, null, () => {
  console.log("Generating Image URLs");
  store.dispatch(generateImageUrlsThunk());
});
