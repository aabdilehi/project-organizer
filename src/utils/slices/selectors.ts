import { createSelector, Selector } from "@reduxjs/toolkit";
import { BoardType, NodeType } from "../classes/new-classes";
import { DefinedBoardObjects, PlainRootState, SelectionState } from "./types";
import { ResizeDirection, DragAction, DragOrigin } from "../enums/items";

const selectBoards = (state: PlainRootState) => state.boards;
const selectNotes = (state: PlainRootState) => state.notes;
const selectImages = (state: PlainRootState) => state.images;
const selectTasks = (state: PlainRootState) => state.tasks;
const selectDocuments = (state: PlainRootState) => state.documents;
const selectGroups = (state: PlainRootState) => state.groups;

// This is such an ugly selector but it is annoyingly necessary
export const selectNodes = createSelector(
  [
    selectBoards,
    selectNotes,
    selectImages,
    selectTasks,
    selectDocuments,
    selectGroups,
  ],
  (boards, notes, images, tasks, documents, groups) => {
    return {
      ...boards,
      ...notes,
      ...images,
      ...tasks,
      ...documents,
      ...groups,
    };
  }
);

//#endregion

export const selectBoardOffset: Selector<
  PlainRootState,
  {
    x: number;
    y: number;
  }
> = (state, id: string) => state.boards[id].offset;
export const selectBoardParent: Selector<
  PlainRootState,
  {
    id: string;
    type: DefinedBoardObjects;
  }
> = (state, id: string) => (state.boards[id] as BoardType).parent;
export const selectBoardChildren: Selector<
  PlainRootState,
  {
    id: string;
    type: DefinedBoardObjects;
  }[]
> = (state, id: string) => state.boards[id].childRefs;

//#region Drag properties
export const selectDraggedNodes: Selector<
  PlainRootState,
  {
    [noteId: string]: NodeType;
  }
> = (state) => state.drag.nodes;

export const selectInitialPosition: Selector<
  PlainRootState,
  {
    x: number;
    y: number;
  }
> = (state) => state.drag.initialPosition;
export const selectTypes: Selector<
  PlainRootState,
  (ResizeDirection | DragAction | DragOrigin)[]
> = (state) => state.drag.types;
//#endregion

//#region Copy properties
export const selectCopiedNodes = (state: PlainRootState) => state.copied.nodes;
export const selectCopiedPosition = (state: PlainRootState) =>
  state.copied.position;
//#endregion

export const selectSelection: Selector<PlainRootState, SelectionState> = (
  state
) => state.selection;
