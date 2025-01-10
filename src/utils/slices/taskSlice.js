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
} from "./nodeActions";

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
    builder.addCase(addNode.action, addNode.reducer("task"));
    builder.addCase(removeNode.action, removeNode.reducer("task"));
    builder.addCase(updateTitle.action, updateTitle.reducer("task"));
    builder.addCase(updateContent.action, updateContent.reducer("task"));
    builder.addCase(updatePosition.action, updatePosition.reducer("task"));
    builder.addCase(offsetPosition.action, offsetPosition.reducer("task"));
    builder.addCase(updateSize.action, updateSize.reducer("task")); // Used for data purposes, not rendering
    builder.addCase(updateParent.action, updateParent.reducer("task"));
  },
});

export const { setBadges, updateDeadline, updateTaskStatus } =
  taskSlice.actions;

export default taskSlice.reducer;
