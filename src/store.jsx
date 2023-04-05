import { configureStore, createSlice } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createStateSyncMiddleware } from "redux-state-sync";

import boardReducer from "./slices/boardSlice";
import columnReducer from "./slices/columnSlice";
import noteReducer from "./slices/noteSlice";
import pictureReducer from "./slices/pictureSlice";
import taskReducer from "./slices/taskSlice";

const initialState = {
  boards: {},
  columns: {},
  notes: {},
  pictures: {},
  tasks: {},
};

const rootReducer = combineReducers({
  boards: boardReducer,
  columns: columnReducer,
  notes: noteReducer,
  pictures: pictureReducer,
  tasks: taskReducer,
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
          "notes/updateText",
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
        ],
      })
    ),
});

export const persistor = persistStore(store);
