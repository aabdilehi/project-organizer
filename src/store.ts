import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storageDB from "redux-persist-indexeddb-storage";
// import storage from "redux-persist/lib/storage";
import { createStateSyncMiddleware } from "redux-state-sync";

import boardReducer from "./utils/slices/boardSlice";
import noteReducer from "./utils/slices/noteSlice";
import pictureReducer from "./utils/slices/pictureSlice";
import taskReducer from "./utils/slices/taskSlice";
import groupReducer from "./utils/slices/groupSlice";
import docReducer from "./utils/slices/docSlice";
import selectionReducer from "./utils/slices/selectionSlice";
import copiedReducer from "./utils/slices/copiedSlice";
import dragReducer from "./utils/slices/dragSlice";

const initialState = {
  boards: {
    root: {
      id: "root",
      title: "Home",
      offset: { x: 0, y: 0 },
      scale: 1,
      childRefs: [],
    },
  },
  notes: {},
  documents: {},
  pictures: {},
  tasks: {},
  selection: {},
  copied: {
    position: { x: 0, y: 0 },
    nodes: [],
  },
  drag: {
    initialPosition: { x: 0, y: 0 },
    nodes: {},
    types: [],
  },
};

const rootReducer = combineReducers({
  boards: boardReducer,
  notes: noteReducer,
  pictures: pictureReducer,
  tasks: taskReducer,
  groups: groupReducer,
  documents: docReducer,
  selection: selectionReducer,
  copied: copiedReducer,
  drag: dragReducer,
});

const storage = storageDB("myDB");
console.log(storage);
const persistConfig = {
  key: "root",
  storage,
  blacklist: ["selection", "copied", "drag"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const stateSyncConfig = {
  blacklist: [
    "persist/PERSIST",
    "persist/REHYDRATE",
    "selection",
    "copied",
    "drag",
  ],
};

export const store = configureStore({
  reducer: persistedReducer,
  initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createStateSyncMiddleware(stateSyncConfig)),
});
export type RootState = ReturnType<typeof rootReducer>;
export const persistor = persistStore(store);
