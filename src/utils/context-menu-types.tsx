import { BoardObjects } from "./enums/items";

import { store } from "../store";
import { DocumentC } from "./classes/classes";
import { v4 as uuidv4 } from "uuid";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updatePosition,
  updateSize,
} from "./slices/nodeActions";
import {
  formatData,
  defaultNote,
  defaultDocument,
  defaultBoard,
  defaultTask,
  defaultGroup,
  NodeType,
  defaultNode,
  NodeTypeMap,
  DocumentType,
  NoteType,
} from "./classes/new-classes";
import sanitizeHtml from "sanitize-html";
import { createNodeThunk, removeNodeThunk } from "./slices/thunks";
import { AnyAction, Dispatch } from "redux";

const convertNoteToDocument = (note) => (dispatch, getState) => {
  if (!note) return;

  const sanitizedContent = sanitizeHtml(note.content, { allowedTags: [] });

  const newDocument: Partial<DocumentType> = {
    id: note.id,
    pX: note.pX,
    pY: note.pY,
    type: BoardObjects.DOCUMENT,
    title:
      sanitizedContent.length > 10
        ? `${sanitizedContent.slice(0, 10)}...`
        : sanitizedContent,
    content: note.content,
    parent: note.parent,
  };
  dispatch(removeNodeThunk(note.id, BoardObjects.NOTE));
  dispatch(createNodeThunk(newDocument));
};

const convertSelectedNodesToDocuments = () => (dispatch, getState) => {
  // I do not like accessing the state like this outside of components but to work around this would be such a huge pain
  const state = getState();
  const selectedNodes = state.selection;
  const notes = state.notes;

  for (const id in selectedNodes) {
    if (Object.prototype.hasOwnProperty.call(selectedNodes, id)) {
      const note = notes[id];

      // it should be notes but does not hurt to check
      if (!note) return;

      dispatch(convertNoteToDocument(note));
    }
  }
};

const convertDocumentToNote = (document) => (dispatch, getState) => {
  if (!document) return;
  const newNote: Partial<NoteType> = {
    id: document.id,
    pX: document.pX,
    pY: document.pY,
    type: BoardObjects.NOTE,
    content: document.content,
    parent: document.parent,
  };

  dispatch(removeNodeThunk(document.id, BoardObjects.DOCUMENT));
  dispatch(createNodeThunk(newNote));
};

const convertSelectedNodesToNotes = () => (dispatch, getState) => {
  // I do not like accessing the state like this outside of components but to work around this would be such a huge pain
  const state = getState();
  const selectedNodes = state.selection;
  const documents = state.documents;

  for (const id in selectedNodes) {
    if (Object.prototype.hasOwnProperty.call(selectedNodes, id)) {
      const document = documents[id];

      // it should be documents but does not hurt to check
      if (!document) return;

      dispatch(convertDocumentToNote(document));
    }
  }
};

// This works fine but gets weird when there are nested groups
const createColumnThunk = (boardId) => (dispatch, getState) => {
  // Get nodes within bounds
  const state = getState();
  const selectedNodes = state.selection;
  const groups = state.groups;
  for (const id in selectedNodes) {
    if (Object.prototype.hasOwnProperty.call(selectedNodes, id)) {
      const group = groups[id];

      // it should be only groups if you can see this option but check anyway
      if (!group) return;

      const { type, pX, pY, sX, sY } = group;
      const nodes = state.boards[boardId].childRefs.map((node) => {
        return state[`${node.childType}s`][node.childId];
      });
      const nodesInBound = nodes.filter((node) => {
        const buffer = 30;
        return (
          node.id != id &&
          node.pX > pX - buffer &&
          node.pX + node.sX < pX + sX + buffer &&
          node.pY > pY - buffer &&
          node.pY + node.sY < pY + sY + buffer
        );
      });
      // Sort by pY value
      const sortedNodes = nodesInBound.sort((a, b) => a.pY - b.pY);
      // Set position using cumulator for y value and group pX for x value
      const padding = 10;
      let y = pY + padding;
      let initialY = y;
      for (let i = 0; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];
        dispatch(
          updatePosition.action({
            id: node.id,
            type: node.type,
            pX: pX + 10,
            pY: y,
          })
        );
        y += node.sY + padding;
      }

      dispatch(updateSize.action({ id, type, sX, sY: y - initialY + padding }));
    }
  }
};

// This works fine but gets weird when there are nested groups
const createRowThunk = (boardId) => (dispatch, getState) => {
  // Get nodes within bounds
  const state = getState();
  const selectedNodes = state.selection;
  const groups = state.groups;
  for (const id in selectedNodes) {
    if (Object.prototype.hasOwnProperty.call(selectedNodes, id)) {
      const group = groups[id];

      // it should be only groups if you can see this option but check anyway
      if (!group) return;

      const { type, pX, pY, sX, sY } = group;
      const nodes = state.boards[boardId].childRefs.map((node) => {
        return state[`${node.childType}s`][node.childId];
      });

      const nodesInBound = nodes.filter((node) => {
        const buffer = 30;
        return (
          node.id != id &&
          node.pX > pX - buffer &&
          node.pX + node.sX < pX + sX + buffer &&
          node.pY > pY - buffer &&
          node.pY + node.sY < pY + sY + buffer
        );
      });
      // Sort by pX value
      const sortedNodes = nodesInBound.sort((a, b) => a.pX - b.pX);
      // Set position using cumulator for y value and group pX for x value
      const padding = 10;
      let x = pX + padding;
      let initialX = x;
      for (let i = 0; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];
        dispatch(
          updatePosition.action({
            id: node.id,
            type: node.type,
            pX: x,
            pY: pY + 10,
          })
        );
        x += node.sX + padding;
      }

      dispatch(updateSize.action({ id, type, sX: x - initialX + padding, sY }));
    }
  }
};

// hinges on there being multiple selected nodes
export const groupItemsThunk = (boardId) => (dispatch, getState) => {
  const state = getState();
  const selectedNodes = state.selection;

  let startX, startY, endX, endY;
  for (const sId in selectedNodes) {
    const { id, type } = selectedNodes[sId];
    const node = state[`${type}s`][id];
    if (node) {
      const { pX, pY, sX, sY } = node;
      startX = !startX || pX < startX ? pX : startX;
      startY = !startY || pY < startY ? pY : startY;
      endX = !endX || pX + sX > endX ? pX + sX : endX;
      endY = !endY || pY + sY > endY ? pY + sY : endY;
    }
  }

  if (!startX || !startY || !endX || !endY) return;
  const padding = 10;
  const newGroup = {
    id: uuidv4(),
    type: BoardObjects.GROUP,
    pX: startX - padding,
    pY: startY - padding,
    parent: {
      id: boardId,
      type: BoardObjects.BOARD,
    },
    sX: endX - startX + padding * 2,
    sY: endY - startY + padding * 2,
  };
  dispatch(createNodeThunk(newGroup));
};

export type ContextMenuItem = {
  label: string;
  onClick?: (
    dispatch: Dispatch<AnyAction>,
    boardId: string,
    x?: number,
    y?: number
  ) => any;
};

type ContextMenu = {
  canCopy: boolean;
  canCut: boolean;
  canPaste: boolean;
  canDelete: boolean;
  items: Array<ContextMenuItem> | null[];
};

type ContextMenuMap = {
  [key in BoardObjects]: ContextMenu;
};

// Main Board (Nothing selected)
export const NullContextMenu: ContextMenu = {
  canCopy: false,
  canCut: false,
  canPaste: true,
  canDelete: false,
  items: [
    {
      label: "New Note",
      onClick: (
        dispatch: Dispatch<AnyAction>,
        boardId: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(
          createNodeThunk({
            type: BoardObjects.NOTE,
            parent: { id: boardId, type: BoardObjects.BOARD },
            pX,
            pY,
          })
        ),
    },
    {
      label: "New Board",
      onClick: (
        dispatch: Dispatch<AnyAction>,
        id: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(
          createNodeThunk({
            type: BoardObjects.BOARD,
            parent: { id, type: BoardObjects.BOARD },
            pX,
            pY,
          })
        ),
    },
    {
      label: "New Group",
      onClick: (
        dispatch: Dispatch<AnyAction>,
        id: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(
          createNodeThunk({
            type: BoardObjects.GROUP,
            parent: { id, type: BoardObjects.BOARD },
            pX,
            pY,
          })
        ),
    },
    {
      label: "New Task",
      onClick: (
        dispatch: Dispatch<AnyAction>,
        id: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(
          createNodeThunk({
            type: BoardObjects.TASK,
            parent: { id, type: BoardObjects.BOARD },
            pX,
            pY,
          })
        ),
    },
    {
      label: "New Document",
      onClick: (
        dispatch: Dispatch<AnyAction>,
        id: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(
          createNodeThunk({
            type: BoardObjects.DOCUMENT,
            parent: { id, type: BoardObjects.BOARD },
            pX,
            pY,
          })
        ),
    },
  ],
};

export const NoteContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: false,
  canDelete: true,
  items: [
    {
      label: "Convert to Document",
      onClick: (
        dispatch: Dispatch<AnyAction>,
        id: string,
        pX?: number,
        pY?: number
      ) => dispatch(convertSelectedNodesToDocuments()),
    },
  ],
};

export const DocumentContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: false,
  canDelete: true,
  items: [
    {
      label: "Convert to Note",
      onClick: (
        dispatch: Dispatch<AnyAction>,
        id: string,
        pX?: number,
        pY?: number
      ) => dispatch(convertSelectedNodesToNotes()),
    },
  ],
};

export const ColumnContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: true,
  canDelete: true,
  items: [],
};

export const ImageContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: true,
  canDelete: true,
  items: [],
};

export const BoardIconContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: true,
  canDelete: true,
  items: [],
};

export const TaskContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: false,
  canDelete: true,
  items: [],
};

// Add support from board -> allow use of dispatch, boardId, and other useful stuff in this onclick stuff
export const GroupContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: false,
  canDelete: true,
  items: [
    {
      label: "Move items into column?",
      onClick: (dispatch, boardId) => {
        dispatch(createColumnThunk(boardId));
      },
    },
    {
      label: "Move items into row?",
      onClick: (dispatch, boardId) => {
        dispatch(createRowThunk(boardId));
      },
    },
  ],
};

export const ContextMenuTypes: ContextMenuMap = {
  [BoardObjects.NONE]: NullContextMenu,
  [BoardObjects.NOTE]: NoteContextMenu,
  [BoardObjects.BOARD]: BoardIconContextMenu,
  [BoardObjects.TASK]: TaskContextMenu,
  [BoardObjects.IMAGE]: ImageContextMenu,
  [BoardObjects.DOCUMENT]: DocumentContextMenu,
  [BoardObjects.GROUP]: GroupContextMenu,
};

export const reduceContextMenu = (types: BoardObjects[]) => {
  if (types.length <= 0) {
    return ContextMenuTypes[BoardObjects.NONE];
  }
  if ((types.length = 1)) {
    return ContextMenuTypes[types[0]];
  }

  const temp: ContextMenu = {
    canCopy: true,
    canCut: true,
    canPaste: true,
    canDelete: true,
    items: [], // for now this will stay empty unless there is only one type
  };

  types.forEach((type) => {
    // for some reason it wont let me do &= or *= without errors so i will do this the long way
    // technically i could add checks to stop doing anything if the value is already 0
    // but i feel the checks wouldnt save any performance and other values would still need to loop
    temp.canCopy = temp.canCopy && ContextMenuTypes[type].canCopy;
    temp.canCut = temp.canCut && ContextMenuTypes[type].canCut;
    temp.canPaste = temp.canPaste && ContextMenuTypes[type].canPaste;
    temp.canDelete = temp.canDelete && ContextMenuTypes[type].canDelete;
  });

  return temp;
};
