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
import { SubTaskType } from "../classes/new-classes";
import { TaskState } from "./types";

export const initialState: TaskState = {};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    updateTaskStatus: (state, action) => {
      const {
        taskId,
        status,
        indeterminate,
      }: { taskId: string; status: boolean; indeterminate: boolean } =
        action.payload;
      const task = state[taskId];
      if (!task) return;

      // Update status of subtasks to match main task
      const subTasks = { ...task.subTasks };
      Object.values(subTasks).forEach(
        (subTask) =>
          (subTasks[subTask.id] = {
            ...subTask,
            status,
          })
      );

      return {
        ...state,
        [taskId]: {
          ...task,
          status,
          indeterminate,
          subTasks,
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
    setSubTasks: (state, action) => {
      const {
        taskId,
        subTasks,
      }: { taskId: string; subTasks: { [subTaskId: string]: SubTaskType } } =
        action.payload;
      if (!taskId || !subTasks) return;
      const task = state[taskId];
      if (!task) return;
      let completedSubTasks = 0;
      const subTaskValues = Object.values(subTasks);
      subTaskValues.forEach(
        (subTask) => (completedSubTasks += +subTask.status)
      );
      return {
        ...state,
        [taskId]: {
          ...task,
          subTasks,
          status:
            completedSubTasks >= subTaskValues.length &&
            subTaskValues.length > 0,
          indeterminate:
            completedSubTasks < subTaskValues.length && completedSubTasks > 0,
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
    builder.addCase(setSliceData.action, setSliceData.reducer("tasks"));
    builder.addCase(addNode.action, addNode.reducer("tasks"));
    builder.addCase(removeNode.action, removeNode.reducer("tasks"));
    builder.addCase(updateTitle.action, updateTitle.reducer("tasks"));
    builder.addCase(updateContent.action, updateContent.reducer("tasks"));
    builder.addCase(updatePosition.action, updatePosition.reducer("tasks"));
    builder.addCase(offsetPosition.action, offsetPosition.reducer("tasks"));
    builder.addCase(updateSize.action, updateSize.reducer("tasks")); // Used for data purposes, not rendering
    builder.addCase(updateParent.action, updateParent.reducer("tasks"));
  },
});

export const { setBadges, setSubTasks, updateDeadline, updateTaskStatus } =
  taskSlice.actions;

export default taskSlice.reducer;
