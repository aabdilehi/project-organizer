import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createStateSyncMiddleware } from "redux-state-sync";

import boardReducer from "./utils/slices/boardSlice";
import columnReducer from "./utils/slices/columnSlice";
import noteReducer from "./utils/slices/noteSlice";
import pictureReducer from "./utils/slices/pictureSlice";
import taskReducer from "./utils/slices/taskSlice";
import docReducer from "./utils/slices/docSlice";
import selectionReducer from "./utils/slices/selectionSlice";
import copiedReducer from "./utils/slices/copiedSlice";
import dragReducer from "./utils/slices/dragSlice";

const initialState = {
  boards: {},
  columns: {},
  notes: {},
  documents: {},
  pictures: {},
  tasks: {},
  selection: {},
  copied: [],
  drag: {},
};

const rootReducer = combineReducers({
  boards: boardReducer,
  columns: columnReducer,
  notes: noteReducer,
  pictures: pictureReducer,
  tasks: taskReducer,
  documents: docReducer,
  selection: selectionReducer,
  copied: copiedReducer,
  drag: dragReducer,
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["selection", "copied", "drag"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const stateSyncConfig = {
  blacklist: ["persist/PERSIST", "persist/REHYDRATE"],
};

const middlewares = [createStateSyncMiddleware(stateSyncConfig)];

export const store = configureStore({
  reducer: persistedReducer,
  initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createStateSyncMiddleware(stateSyncConfig)),
});

export const persistor = persistStore(store);
