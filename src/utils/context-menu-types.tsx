import { BoardObjects } from "./enums/items";

import { PlainRootState } from "./slices/types";
import { NodeSliceMap, SliceNodeMap } from "./slices/types";
import { updatePosition, updateSize } from "./slices/nodeActions";
import {
  DocumentType,
  GroupType,
  isRoot,
  NoteType,
} from "./classes/new-classes";
import sanitizeHtml from "sanitize-html";
import {
  createNodeThunk,
  newNodeContextMenuThunk,
  removeNodeThunk,
} from "./slices/thunks";
import { Dispatch } from "redux";
import { updateOffset, updateScale } from "./slices/boardSlice";
import { nanoid, ThunkAction } from "@reduxjs/toolkit";

function convertNoteToDocument(
  note: NoteType
): ThunkAction<void, PlainRootState, unknown, any> {
  return (dispatch: Dispatch<any>, getState) => {
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
}

function convertSelectedNodesToDocuments(): ThunkAction<
  void,
  PlainRootState,
  unknown,
  any
> {
  return (dispatch, getState) => {
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
}

function convertDocumentToNote(
  document: DocumentType
): ThunkAction<void, PlainRootState, unknown, any> {
  return (dispatch, getState) => {
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
}

function convertSelectedNodesToNotesThunk(): ThunkAction<
  void,
  PlainRootState,
  unknown,
  any
> {
  return (dispatch, getState) => {
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
}

// This works fine but gets weird when there are nested groups
function createColumnThunk(
  boardId: string
): ThunkAction<void, PlainRootState, unknown, any> {
  return (dispatch, getState) => {
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

        const nodes = state.boards[boardId].childRefs
          .map((partial) => {
            const slice = NodeSliceMap[partial.type];
            const node = state[slice][partial.id];
            if (!isRoot(node)) return node;
          })
          .filter((node) => node != null);

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
        let maxX: number | null = null;
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
          if (maxX == null || node.sX + padding > maxX)
            maxX = node.sX + padding;
        }

        dispatch(
          updateSize.action({
            id,
            type,
            sX: maxX == null ? sX : maxX + padding,
            sY: y - initialY + padding,
          })
        );
      }
    }
  };
}

// This works fine but gets weird when there are nested groups
function createRowThunk(
  boardId: string
): ThunkAction<void, PlainRootState, unknown, any> {
  return (dispatch, getState) => {
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

        const nodes = state.boards[boardId].childRefs
          .map((partial) => {
            const slice = NodeSliceMap[partial.type];
            const node = state[slice][partial.id];
            if (!isRoot(node)) return node;
          })
          .filter((node) => node != null);

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
        let maxY: number | null = null;
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
          if (maxY == null || node.sY + padding > maxY)
            maxY = node.sY + padding;
        }

        dispatch(
          updateSize.action({
            id,
            type,
            sX: x - initialX + padding,
            sY: maxY == null ? sY : maxY + padding,
          })
        );
      }
    }
  };
}

export function recenterBoardThunk(
  boardId: string
): ThunkAction<void, PlainRootState, unknown, any> {
  return (dispatch, getState) => {
    dispatch(updateOffset({ id: boardId, x: 0, y: 0 }));
    dispatch(updateScale({ id: boardId, scale: 1 }));
  };
}

// hinges on there being multiple selected nodes
export function groupItemsThunk(
  boardId: string
): ThunkAction<void, PlainRootState, unknown, any> {
  return (dispatch, getState) => {
    const state = getState();
    const selectedNodes = state.selection;

    let startX, startY, endX, endY;
    for (const sId in selectedNodes) {
      const { id, type } = selectedNodes[sId];
      const sliceName = NodeSliceMap[type];
      const slice = state[sliceName];
      const node = slice[id];
      if (node && !isRoot(node)) {
        const { pX, pY, sX, sY } = node;
        startX = !startX || pX < startX ? pX : startX;
        startY = !startY || pY < startY ? pY : startY;
        endX = !endX || pX + sX > endX ? pX + sX : endX;
        endY = !endY || pY + sY > endY ? pY + sY : endY;
      }
    }

    if (!startX || !startY || !endX || !endY) return;
    const padding = 10;
    const newGroup: Partial<GroupType> = {
      id: nanoid(),
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
}

export type ContextMenuItem = {
  label: string;
  onClick?: (
    dispatch: Dispatch<any>,
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
      label: "Recenter",
      onClick: (
        dispatch: Dispatch<any>,
        boardId: string,
        pX?: number,
        pY?: number
      ) => dispatch(recenterBoardThunk(boardId)),
    },
    {
      label: "New Note",
      onClick: (
        dispatch: Dispatch<any>,
        boardId: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(newNodeContextMenuThunk(boardId, pX, pY, BoardObjects.NOTE)),
    },
    {
      label: "New Board",
      onClick: (
        dispatch: Dispatch<any>,
        boardId: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(newNodeContextMenuThunk(boardId, pX, pY, BoardObjects.BOARD)),
    },
    {
      label: "New Group",
      onClick: (
        dispatch: Dispatch<any>,
        boardId: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(newNodeContextMenuThunk(boardId, pX, pY, BoardObjects.GROUP)),
    },
    {
      label: "New Task",
      onClick: (
        dispatch: Dispatch<any>,
        boardId: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(newNodeContextMenuThunk(boardId, pX, pY, BoardObjects.TASK)),
    },
    {
      label: "New Document",
      onClick: (
        dispatch: Dispatch<any>,
        boardId: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(
          newNodeContextMenuThunk(boardId, pX, pY, BoardObjects.DOCUMENT)
        ),
    },
    {
      label: "New Image",
      onClick: (
        dispatch: Dispatch<any>,
        boardId: string,
        pX?: number,
        pY?: number
      ) =>
        dispatch(newNodeContextMenuThunk(boardId, pX, pY, BoardObjects.IMAGE)),
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
        dispatch: Dispatch<any>,
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
        dispatch: Dispatch<any>,
        id: string,
        pX?: number,
        pY?: number
      ) => dispatch(convertSelectedNodesToNotesThunk()),
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
      label: "Arrange as column",
      onClick: (dispatch, boardId) => {
        dispatch(createColumnThunk(boardId));
      },
    },
    {
      label: "Arrange as row",
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
