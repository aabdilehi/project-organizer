import { configureStore, createSlice } from "@reduxjs/toolkit";
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

const initialState = {
  boards: {},
  columns: {},
  notes: {},
  documents: {},
  pictures: {},
  tasks: {},
};

const rootReducer = combineReducers({
  boards: boardReducer,
  columns: columnReducer,
  notes: noteReducer,
  pictures: pictureReducer,
  tasks: taskReducer,
  documents: docReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      createStateSyncMiddleware({
        whitelist: [
          "notes/addNote",
          "notes/updateContent",
          "notes/updatePosition",
          "notes/updateSize",
          "notes/updateParent",
          "boards/addBoard",
          "boards/addChild",
          "boards/removeChild",
          "boards/updateTitle",
          "boards/updateParent",
          "boards/updatePosition",
          "columns/updatePosition",
          "columns/updateSize",
          "columns/addColumn",
          "columns/addChild",
          "columns/removeChild",
          "columns/updateTitle",
          "pictures/addPicture",
          "pictures/updateImage",
          "pictures/updateLabel",
          "pictures/updateLabelVisibility",
          "pictures/updatePosition",
          "pictures/updateSize",
          "pictures/updateParent",
          "tasks/addTask",
          "tasks/updateText",
          "tasks/updateDeadline",
          "tasks/updateTaskStatus",
          "tasks/updateSummary",
          "tasks/updatePosition",
          "tasks/updateParent",
          "documents/addDocument",
          "documents/updateContent",
          "documents/updatePosition",
          "documents/updateTitle",
          "documents/toggleView",
          "documents/updateParent",
        ],
      })
    ),
});

export const persistor = persistStore(store);
