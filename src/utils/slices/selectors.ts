import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";

const selectBoards = (state: RootState) => state.boards;
const selectNotes = (state: RootState) => state.notes;
const selectPictures = (state: RootState) => state.pictures;
const selectTasks = (state: RootState) => state.tasks;
const selectDocuments = (state: RootState) => state.documents;
const selectGroups = (state: RootState) => state.groups;

// This is such an ugly selector but it is annoyingly necessary
export const selectNodes = createSelector(
  [
    selectBoards,
    selectNotes,
    selectPictures,
    selectTasks,
    selectDocuments,
    selectGroups,
  ],
  (boards, notes, pictures, tasks, documents, groups) => {
    return {
      ...boards,
      ...notes,
      ...pictures,
      ...tasks,
      ...documents,
      ...groups,
    };
  }
);

//#endregion

export const selectBoardPosition = (state, id) => state.boards[id].position;
export const selectBoardOffset = (state, id) => state.boards[id].offset;
export const selectBoardParent = (state, id) => state.boards[id].parent;
export const selectBoardChildren = (state, id) => state.boards[id].childRefs;

//#region Drag properties
export const selectDraggedNodes = (state: RootState) => state.drag.nodes;
export const selectInitialPosition = (state: RootState) =>
  state.drag.initialPosition;
export const selectTypes = (state: RootState) => state.drag.types;

export const selectDragRelatedNodes = (state: RootState) => {
  const nodes = {};
  Object.values(state.drag.nodes).forEach((node) => {
    // drag specific replacement to nodes selector
    const retrievedNode = state[`${node.type}s`][node.id];
    if (!retrievedNode) return;
    nodes[retrievedNode.id] = retrievedNode;
  });
  return nodes;
};
//#endregion

//#region Copy properties
export const selectCopiedNodes = (state: RootState) => state.copied.nodes;
export const selectCopiedPosition = (state: RootState) => state.copied.position;
//#endregion

export const selectSelection = (state) => state.selection;
