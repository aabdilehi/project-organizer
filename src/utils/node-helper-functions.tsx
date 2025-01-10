import { AnyAction, createAsyncThunk, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState, store } from "../store";
import { BoardObjects } from "./enums/items";
import {
  clearCopiedNodes,
  setPosition,
  addCopyNode,
} from "./slices/copiedSlice";
import {
  removeChild,
  removeNode,
  addNode,
  addChild,
} from "./slices/nodeActions";
import { v4 as uuidv4 } from "uuid";

//#region Delete functions
export const deleteSelection = createAsyncThunk(
  "selection/deleteSelection",
  async (payload, { dispatch, getState }) => {
    const state = getState();
    Object.values(state.selection).forEach(
      ({
        id,
        type,
        parent,
      }: {
        id: string;
        type: BoardObjects;
        parent: { id: string; type: BoardObjects };
      }) => {
        manualDelete(id, type, parent, state, dispatch);
      }
    );
  }
);

const manualDelete = (
  id: string,
  type: BoardObjects,
  parent: { id: string; type: BoardObjects },
  state: unknown,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  switch (type) {
    case BoardObjects.BOARD:
      deleteBoard(id, parent, state, dispatch);
      break;
    case BoardObjects.COLUMN:
      deleteColumn(id, parent, state, dispatch);
      break;
    default:
      deleteOther(id, type, parent, dispatch);
      break;
  }
};

const deleteBoard = (
  id: string,
  parent: { id: string; type: BoardObjects },
  state: unknown,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  const board = state.boards[id];
  if (!board) return;

  board.childRefs.forEach(({ childId, childType }) => {
    manualDelete(
      childId,
      childType,
      { id: board.id, type: board.type },
      state,
      dispatch
    );
  });

  dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
  dispatch(removeNode.action({ id, type: BoardObjects.BOARD }));
};

const deleteColumn = (
  id: string,
  parent: { id: string; type: BoardObjects },
  state: unknown,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  const column = state.columns[id];
  if (!column) return;

  column.childRefs.forEach(({ childId, childType }) => {
    manualDelete(
      childId,
      childType,
      { id: column.id, type: column.type },
      state,
      dispatch
    );
  });

  dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
  dispatch(removeNode.action({ id, type: BoardObjects.COLUMN }));
};

// note, task, picture, document
const deleteOther = (
  id: string,
  type: BoardObjects,
  parent: { id: string; type: BoardObjects },
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
  dispatch(removeNode.action({ id, type }));
};

//#endregion

//#region Copy functions
export const copySelection = (boardId: string, x?: number, y?: number) => {
  const state = store.getState();
  if (x && y) {
    store.dispatch(setPosition({ x, y }));
    console.log(state.selection);
  } else {
    // if the mouse position cannot be obtained for the initial position
    // find the central point among the selected nodes and use that instead as the initial position
    let centroidX = 0;
    let centroidY = 0;
    let centroidCount = 0;
    Object.values(state.selection).forEach((sel) => {
      let node = state[`${sel.type}s`];
      if (!node) return;
      centroidCount += 1;
      centroidX += node.pX;
      centroidY += node.pY;
    });

    const centroid = {
      x: centroidX / centroidCount,
      y: centroidY / centroidCount,
    };
    store.dispatch(setPosition(centroid));
  }
  store.dispatch(clearCopiedNodes(undefined));
  Object.values(state.selection).forEach(
    ({ id, type }: { id: string; type: BoardObjects }) => {
      manualCopy(id, type, state);
    }
  );
};

const manualCopy = (id: string, type: BoardObjects, state: RootState) => {
  switch (type) {
    case BoardObjects.BOARD:
      copyBoard(id, state);
      break;
    case BoardObjects.COLUMN:
      copyColumn(id, state);
      break;
    default:
      copyOther(id, type, state);
      break;
  }
};

// board
const copyBoard = (id: string, state: RootState) => {
  const board = state.boards[id];
  if (!board) return;

  board.childRefs.forEach(({ childId, childType }) => {
    manualCopy(childId, childType, state);
  });
  store.dispatch(addCopyNode(board));
};

// column
const copyColumn = (id: string, state: RootState) => {
  const column = state.columns[id];
  if (!column) return;

  column.childRefs.forEach(({ childId, childType }) => {
    manualCopy(childId, childType, state);
  });
  store.dispatch(addCopyNode(column));
};

// note, task, picture, document
const copyOther = (id: string, type: BoardObjects, state: RootState) => {
  if (!state) return;
  const node = state[type + "s"][id];
  if (!node) return;
  store.dispatch(addCopyNode(node));
};

//#endregion

//#region Paste functions

export const pasteToSelectedNodes = (boardId: string, x: number, y: number) => {
  const state = store.getState();
  const selection = Object.values(state.selection);
  if (selection.length <= 0) {
    duplicateCopiedNodes(boardId, BoardObjects.BOARD, state, boardId, x, y);
  } else {
    selection.forEach(({ id, type }: { id: string; type: BoardObjects }) => {
      duplicateCopiedNodes(id, type, state, boardId, x, y);
    });
  }
};

const duplicateCopiedNodes = (
  id: string,
  type: BoardObjects,
  state: RootState,
  boardId: string,
  x?: number,
  y?: number
) => {
  const mappedIDs = {};

  // Important to get all of them done first even though it is wasteful
  // Both the nodes, their parents, and their children need to have a corresponding ID to map to

  // I guess the copied nodes have the parent and childrefs so there is no need for two loops or even adding children?
  // Just edit the values and addNode

  const { position, nodes } = state.copied;

  Object.values(nodes).forEach((item) => {
    mappedIDs[item.id] = uuidv4();
  });

  // duplicate nodes with newly assigned IDs
  Object.values(nodes).forEach((item) => {
    const node = {
      ...item,
      id: mappedIDs[item.id],
      pX: item.pX - position.x + x,
      pY: item.pY - position.y + y,
    };

    // Check if parent's ID is in object.
    // if true, use mappedIDs to update; else assign id of node that triggered the paste
    node.parent = !!mappedIDs[node.parent.id]
      ? { ...node.parent, id: mappedIDs[node.parent.id] }
      : { id, type }; // paste node id;

    if (!node.childRefs) {
      store.dispatch(addNode.action(node));
      if (!mappedIDs[item.parent.id]) {
        store.dispatch(
          addChild.action({ id, type, cId: node.id, cType: node.type })
        );
        return;
      }
    } else {
      // Update childRefs of IDS
      node.childRefs = node.childRefs
        .map(({ childId, childType }) => {
          return { childId: mappedIDs[childId] ?? undefined, childType };
        })
        .filter(({ childId, childType }) => childId !== undefined);

      console.log(node);
      store.dispatch(addNode.action(node));
      if (!mappedIDs[item.parent.id]) {
        if (node.type == type && type == BoardObjects.COLUMN) {
          store.dispatch(
            addChild.action({
              id: boardId,
              type: BoardObjects.BOARD,
              cId: node.id,
              cType: node.type,
            })
          );
        } else {
          store.dispatch(
            addChild.action({ id, type, cId: node.id, cType: node.type })
          );
        }
      }
    }

    return;
  });
};

//#endregion
