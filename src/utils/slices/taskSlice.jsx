import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updateTitle,
  updateContent,
  updatePosition,
  updateParent,
} from "./nodeActions";

const taskSlice = createSlice({
  name: "tasks",
  initialState: {},
  reducers: {
    updateTaskStatus: (state, action) => {
      const { taskId, taskStatus } = action.payload;
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          taskStatus,
        },
      };
    },
    updateDeadline: (state, action) => {
      const { taskId, deadline } = action.payload;
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          deadline,
        },
      };
    },
    addBadge: (state, action) => {
      const { taskId, newBadge } = action.payload;
      const task = state[taskId];
      const badges = { ...task.badges };
      badges[newBadge.id] = newBadge;
      return {
        ...state,
        [taskId]: {
          ...task,
          badges,
        },
      };
    },
    removeBadge: (state, action) => {
      const { taskId, badgeId } = action.payload;
      const task = state[taskId];
      const badges = { ...task.badges };
      delete badges[badgeId];
      return {
        ...state,
        [taskId]: {
          ...task,
          badges,
        },
      };
    },
    updateBadgeText: (state, action) => {
      const { taskId, badgeId, text } = action.payload;
      const task = state[taskId];
      const badges = task.badges;
      const badge = { ...badges[badgeId] };
      badge.text = text;

      return {
        ...state,
        [taskId]: {
          ...task,
          badges: {
            ...task.badges,
            [badgeId]: badge,
          },
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addNode.action, addNode.reducer("to-do"));
    builder.addCase(removeNode.action, removeNode.reducer("to-do"));
    builder.addCase(updateTitle.action, updateTitle.reducer("to-do"));
    builder.addCase(updateContent.action, updateContent.reducer("to-do"));
    builder.addCase(updatePosition.action, updatePosition.reducer("to-do"));
    builder.addCase(updateParent.action, updateParent.reducer("to-do"));
  },
});

export const {
  addBadge,
  removeBadge,
  updateBadgeText,
  updateDeadline,
  updateTaskStatus,
} = taskSlice.actions;

export default taskSlice.reducer;
