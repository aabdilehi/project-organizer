import { BoardObjects } from "../enums/items";
import { v4 as uuidv4 } from "uuid";

//#region Node type definitions
export type BadgeType = {
  id: string;
  text: string;
  color: string;
};
export type SubTaskType = {
  id: string;
  text: string;
  status: boolean;
};
export type NodeType = {
  id: string;
  type: BoardObjects;
  pX: number;
  pY: number;
  sX: number;
  sY: number;
  parent: { id: string; type: BoardObjects };
};
export type NoteType = NodeType & {
  content: string;
};
export type DocumentType = NodeType & {
  title: string;
  content: string;
};
export type TaskType = NodeType & {
  title: string;
  status: boolean;
  indeterminate: boolean;
  content: string | undefined;
  badges: { [badgeId: string]: BadgeType };
  subTasks: { [subTaskId: string]: SubTaskType };
  deadline: Date | undefined;
};
export type ImageType = NodeType & {
  imageId: string | undefined;
};
export type GroupType = NodeType & {
  title: string;
};
export type RootBoardType = {
  id: string;
  title: string;
  type: BoardObjects;
  offset: { x: number; y: number };
  scale: number;
  childRefs: Partial<NodeType>[] | [];
};
export type BoardType = NodeType & RootBoardType;
//#endregion

//#region Type guards
function isNote(
  node: NoteType | DocumentType | TaskType | GroupType | BoardType
): node is NoteType {
  return (node as NoteType).type !== BoardObjects.NOTE;
}
function isDocument(
  node: DocumentType | DocumentType | TaskType | GroupType | BoardType
): node is DocumentType {
  return (node as DocumentType).type !== BoardObjects.DOCUMENT;
}
function isTask(
  node: TaskType | DocumentType | TaskType | GroupType | BoardType
): node is TaskType {
  return (node as TaskType).type !== BoardObjects.TASK;
}
function isGroup(
  node: GroupType | DocumentType | TaskType | GroupType | BoardType
): node is GroupType {
  return (node as GroupType).type !== BoardObjects.GROUP;
}
function isBoard(
  node: BoardType | DocumentType | TaskType | GroupType | BoardType
): node is BoardType {
  return (node as BoardType).type !== BoardObjects.BOARD;
}
//#endregion

//#region Default values for node types
export const defaultNode: NodeType = {
  id: "",
  type: BoardObjects.NONE,
  pX: 0,
  pY: 0,
  sX: 0,
  sY: 0,
  parent: {
    id: "root",
    type: BoardObjects.BOARD,
  },
};
export const defaultNote: NoteType = {
  ...defaultNode,
  type: BoardObjects.NOTE,
  sX: 200,
  sY: 200,
  content: `<p>New note</p>`,
};
export const defaultDocument: DocumentType = {
  ...defaultNode,
  type: BoardObjects.DOCUMENT,
  title: "New document",
  content: "",
};
export const defaultTask: TaskType = {
  ...defaultNode,
  type: BoardObjects.TASK,
  title: "New task",
  status: false,
  indeterminate: false,
  badges: {},
  content: "",
  subTasks: {},
  deadline: undefined,
};
export const defaultImage: ImageType = {
  ...defaultNode,
  type: BoardObjects.IMAGE,
  imageId: undefined,
};
export const defaultSubTask: SubTaskType = {
  id: "",
  text: "New Subtask",
  status: false,
};
export const defaultGroup: GroupType = {
  ...defaultNode,
  type: BoardObjects.GROUP,
  sX: 500,
  sY: 500,
  title: "New group",
};

export const defaultRoot: RootBoardType = {
  id: "root",
  title: "Home",
  type: BoardObjects.BOARD,
  offset: { x: 0, y: 0 },
  scale: 1,
  childRefs: [],
};
export const defaultBoard: BoardType = {
  ...defaultNode,
  type: BoardObjects.BOARD,
  title: "New board",
  offset: { x: 0, y: 0 },
  scale: 1,
  sX: 65,
  sY: 120,
  childRefs: [],
};
//#endregion

export const NodeTypeMap: { [key in BoardObjects]: NodeType } = {
  [BoardObjects.NONE]: defaultNode,
  [BoardObjects.NOTE]: defaultNote,
  [BoardObjects.BOARD]: defaultBoard,
  [BoardObjects.TASK]: defaultTask,
  [BoardObjects.GROUP]: defaultGroup,
  [BoardObjects.IMAGE]: defaultImage,
  [BoardObjects.DOCUMENT]: defaultDocument,
};

export const formatData = <T extends NodeType>(
  input: Partial<T>,
  defaults: T
): T => {
  return {
    ...defaults,
    ...input,
    id: input.id ?? uuidv4(),
  } as T;
};

export const formatRoot = (input: Partial<RootBoardType>) => {
  return {
    ...defaultRoot,
    ...input,
  } as RootBoardType;
};

const defaultBadge: Partial<BadgeType> = {
  text: "New Badge",
  color: "red",
};
export const createBadge = (badge?: Partial<BadgeType>): BadgeType => {
  return { ...defaultBadge, id: uuidv4(), ...badge } as BadgeType;
};

export const createSubTask = (subTask?: Partial<SubTaskType>): SubTaskType => {
  return { ...defaultSubTask, id: uuidv4(), ...subTask } as SubTaskType;
};

type Size = {
  min?: {
    x?: Number;
    y?: Number;
  };
  max?: {
    x?: Number;
    y?: Number;
  };
};

export const SizeClassMap: { [type in BoardObjects]: Size } = {
  [BoardObjects.NOTE]: { min: { x: 75, y: 50 }, max: { x: 1200, y: 1200 } },
  [BoardObjects.NONE]: {},
  [BoardObjects.BOARD]: { min: { x: 75, y: 75 }, max: { x: 1000, y: 1000 } },
  [BoardObjects.TASK]: { min: { x: 250 }, max: { x: 250 } },
  [BoardObjects.GROUP]: { min: { x: 100, y: 100 } },
  [BoardObjects.IMAGE]: { min: { x: 100, y: 100 } },
  [BoardObjects.DOCUMENT]: { min: { x: 75, y: 75 }, max: { x: 1000, y: 1000 } },
};
