import { Binary } from "bson";
import {
  BoardType,
  RootBoardType,
  GroupType,
  ImageType,
  NoteType,
  DocumentType,
  TaskType,
  NodeType,
} from "../classes/new-classes";
import {
  ResizeDirection,
  DragAction,
  DragOrigin,
  BoardObjects,
} from "../enums/items";
import { combineReducers, $CombinedState } from "redux";

export type BoardState = { [id: string]: BoardType | RootBoardType };
export type DocumentState = { [id: string]: DocumentType };
export type GroupState = { [id: string]: GroupType };
export type ImageState = { [id: string]: ImageType };
export type NoteState = { [id: string]: NoteType };
export type TaskState = { [id: string]: TaskType };

export type ImageDataState = { [id: string]: Binary };
export type ImageMapState = { [id: string]: string };

export type DragState = {
  initialPosition: { x: number; y: number };
  nodes: { [noteId: string]: NodeType };
  types: Array<ResizeDirection | DragAction | DragOrigin>;
};

export type CopiedState = {
  position: { x: number; y: number };
  nodes: Array<NodeType>;
};
export type SelectionState = {
  [id: string]: {
    id: string;
    type: DefinedBoardObjects;
    parent: { id: string; type: DefinedBoardObjects };
  };
};

import boardReducer from "./boardSlice";
import noteReducer from "./noteSlice";
import imageReducer from "./imageSlice";
import taskReducer from "./taskSlice";
import groupReducer from "./groupSlice";
import docReducer from "./docSlice";
import selectionReducer from "./selectionSlice";
import copiedReducer from "./copiedSlice";
import dragReducer from "./dragSlice";
import imageMapReducer from "./imageMapSlice";
import imageDataReducer from "./imageDataSlice";

const nonPersistedRootReducer = combineReducers({
  boards: boardReducer,
  notes: noteReducer,
  images: imageReducer,
  tasks: taskReducer,
  groups: groupReducer,
  documents: docReducer,
  selection: selectionReducer,
  copied: copiedReducer,
  drag: dragReducer,
  imageMap: imageMapReducer,
  imageData: imageDataReducer,
});

export type PlainRootState = ReturnType<typeof nonPersistedRootReducer>;
type BoardObjectType = BoardObjects;
export type DefinedBoardObjects = Exclude<BoardObjectType, BoardObjects.NONE>;

type PlainRootStateKeys = keyof PlainRootState;
export type NodeSliceKeys = Exclude<
  PlainRootStateKeys,
  | typeof $CombinedState
  | "imageMap"
  | "imageData"
  | "drag"
  | "selection"
  | "copied"
>;

export const SliceNodeMap: {
  [key in NodeSliceKeys]: DefinedBoardObjects;
} = {
  boards: BoardObjects.BOARD,
  notes: BoardObjects.NOTE,
  tasks: BoardObjects.TASK,
  groups: BoardObjects.GROUP,
  images: BoardObjects.IMAGE,
  documents: BoardObjects.DOCUMENT,
};

export const NodeSliceMap: {
  [key in DefinedBoardObjects]: NodeSliceKeys;
} = {
  [BoardObjects.BOARD]: "boards",
  [BoardObjects.NOTE]: "notes",
  [BoardObjects.TASK]: "tasks",
  [BoardObjects.GROUP]: "groups",
  [BoardObjects.IMAGE]: "images",
  [BoardObjects.DOCUMENT]: "documents",
};
