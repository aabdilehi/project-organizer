import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updateTitle,
  updateContent,
  updatePosition,
  updateParent,
  offsetPosition,
  updateSize,
  setSliceData,
} from "./nodeActions";
import { BoardObjects } from "../enums/items";

const taskSlice = createSlice({
  name: "tasks",
  initialState: {},
  reducers: {
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state[taskId];
      if (!task) return;
      return {
        ...state,
        [taskId]: {
          ...task,
          status,
        },
      };
    },
    updateDeadline: (state, action) => {
      const { taskId, deadline } = action.payload;
      const task = state[taskId];
      if (!task || !deadline) return;
      return {
        ...state,
        [taskId]: {
          ...task,
          deadline,
        },
      };
    },
    setBadges: (state, action) => {
      const { taskId, badges } = action.payload;
      const task = state[taskId];
      if (!task || !badges) return;
      return {
        ...state,
        [taskId]: {
          ...task,
          badges,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      setSliceData.action,
      setSliceData.reducer(BoardObjects.TASK)
    );
    builder.addCase(addNode.action, addNode.reducer(BoardObjects.TASK));
    builder.addCase(removeNode.action, removeNode.reducer(BoardObjects.TASK));
    builder.addCase(updateTitle.action, updateTitle.reducer(BoardObjects.TASK));
    builder.addCase(
      updateContent.action,
      updateContent.reducer(BoardObjects.TASK)
    );
    builder.addCase(
      updatePosition.action,
      updatePosition.reducer(BoardObjects.TASK)
    );
    builder.addCase(
      offsetPosition.action,
      offsetPosition.reducer(BoardObjects.TASK)
    );
    builder.addCase(updateSize.action, updateSize.reducer(BoardObjects.TASK)); // Used for data purposes, not rendering
    builder.addCase(
      updateParent.action,
      updateParent.reducer(BoardObjects.TASK)
    );
  },
});

export const { setBadges, updateDeadline, updateTaskStatus } =
  taskSlice.actions;

export default taskSlice.reducer;
