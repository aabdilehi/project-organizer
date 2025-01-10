import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";

const selectBoards = (state: RootState) => state.boards;
const selectColumns = (state: RootState) => state.columns;
const selectNotes = (state: RootState) => state.notes;
const selectPictures = (state: RootState) => state.pictures;
const selectTasks = (state: RootState) => state.tasks;
const selectDocuments = (state: RootState) => state.documents;
const selectGroups = (state: RootState) => state.groups;

export const selectNodes = createSelector(
  [
    selectBoards,
    selectColumns,
    selectNotes,
    selectPictures,
    selectTasks,
    selectDocuments,
    selectGroups,
  ],
  (boards, columns, notes, pictures, tasks, documents, groups) => {
    console.log("Node query is running");
    return {
      ...boards,
      ...columns,
      ...notes,
      ...pictures,
      ...tasks,
      ...documents,
      ...groups,
    };
  }
);

const selectBoardId = (state: RootState, boardId: string) => boardId; // This is dumb
export const selectBoard = createSelector(
  [selectBoards, selectBoardId],
  (boards, boardId) => boards[boardId]
);

export const selectBoardTitle = createSelector(
  [selectBoard],
  (board) => board.title
);
export const selectBoardParent = createSelector(
  [selectBoard],
  (board) => board.parent
);
export const selectBoardScale = createSelector(
  [selectBoard],
  (board) => board.scale
);
export const selectBoardOffset = createSelector(
  [selectBoard],
  (board) => board.offset
);
export const selectBoardChildren = createSelector(
  [selectBoard],
  (board) => board.childRefs
);

const selectDrag = (state: RootState) => state.drag;
export const selectDraggedNodes = createSelector([selectDrag], (drag) => {
  console.log(drag.nodes);
  return drag.nodes;
});
export const selectInitialPosition = createSelector(
  [selectDrag],
  (drag) => drag.initialPosition
);
export const selectTypes = createSelector([selectDrag], (drag) => drag.types);

const selectCopied = (state: RootState) => state.copied;
export const selectCopiedNodes = createSelector([selectCopied], (copied) => {
  console.log(copied.nodes);
  return copied.nodes;
});
export const selectCopiedPosition = createSelector(
  [selectCopied],
  (copied) => copied.position
);

export const selectSelection = (state) => state.selection;
