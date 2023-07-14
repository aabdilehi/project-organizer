import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { taskSchema } from "../schema";

const taskSlice = createSlice({
  name: "tasks",
  initialState: {},
  reducers: {
    addTask: (state, action) => {
      const normalizedData = normalize(action.payload, taskSchema);
      const { entities } = normalizedData;
      return {
        ...state,
        ...entities.tasks,
      };
    },
    updateText: (state, action) => {
      const { taskId, text } = action.payload;
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          text,
        },
      };
    },
    updateSummary: (state, action) => {
      const { taskId, summary } = action.payload;
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          summary,
        },
      };
    },
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
    updatePosition: (state, action) => {
      const { taskId, pX, pY } = action.payload;
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          pX,
          pY,
        },
      };
    },
    updateSize: (state, action) => {
      const { taskId, sX, sY } = action.payload;
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          sX,
          sY,
        },
      };
    },
    updateBadges: (state, action) => {
      const { taskId, badges } = action.payload;
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          badges,
        },
      };
    },
    addBadge: (state, action) => {
      const { taskId, newBadge } = action.payload;
      const task = state[taskId];
      console.log(newBadge);
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
    updateParent: (state, action) => {
      const { taskId, newParentId, newParentType } = action.payload;
      console.log(newParentType);
      const task = state[taskId];
      return {
        ...state,
        [taskId]: {
          ...task,
          parent: { id: newParentId, type: newParentType },
        },
      };
    },
    removeTask: (state, action) => {
      const { taskId } = action.payload;
      delete state[taskId];
    },
  },
});

export const {
  addTask,
  updateText,
  updatePosition: updateTaskPosition,
  updateSize,
  updateSummary,
  addBadge,
  removeBadge,
  updateBadgeText,
  updateDeadline,
  updateTaskStatus,
  updateParent: updateTaskParent,
  removeTask,
} = taskSlice.actions;

export default taskSlice.reducer;
