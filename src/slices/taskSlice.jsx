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
  updateDeadline,
  updateTaskStatus,
  updateParent: updateTaskParent,
  removeTask,
} = taskSlice.actions;

export default taskSlice.reducer;
