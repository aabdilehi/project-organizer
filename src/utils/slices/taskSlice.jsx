import { createSlice } from "@reduxjs/toolkit";
import {
  addNode,
  removeNode,
  updateTitle,
  updateContent,
  updatePosition,
  updateParent,
  offsetPosition,
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
    addBadge: (state, action) => {
      const { taskId, newBadge } = action.payload;
      const task = state[taskId];
      if (!task || !newBadge) return;
      return {
        ...state,
        [taskId]: {
          ...task,
          badges: { ...task.badges, [newBadge.id]: newBadge },
        },
      };
    },
    removeBadge: (state, action) => {
      const { taskId, badgeId } = action.payload;
      const task = state[taskId];
      if (!task) return;
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
      if (!task || !badge) return;
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
    builder.addCase(addNode.action, addNode.reducer("task"));
    builder.addCase(removeNode.action, removeNode.reducer("task"));
    builder.addCase(updateTitle.action, updateTitle.reducer("task"));
    builder.addCase(updateContent.action, updateContent.reducer("task"));
    builder.addCase(updatePosition.action, updatePosition.reducer("task"));
    builder.addCase(offsetPosition.action, offsetPosition.reducer("task"));
    builder.addCase(updateParent.action, updateParent.reducer("task"));
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
