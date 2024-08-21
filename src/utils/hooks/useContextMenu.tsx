import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ContextMenuItem,
  NewNodeMenuItem,
  reduceContextMenu,
} from "../context-menu-types";
import { store } from "../../store";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
} from "../slices/nodeActions";
import { BoardObjects } from "../enums/items";
import {
  addCopyNode,
  clearCopiedNodes,
  setPosition,
} from "../slices/copiedSlice";
import { EmptyObject } from "redux";
import { PersistPartial } from "redux-persist/es/persistReducer";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import ReactDOM from "react-dom";
import { StoreState } from "../enums/state-type";

//#region Delete functions
const deleteSelection = () => {
  const state = store.getState();
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
      manualDelete(id, type, parent, state);
    }
  );
};

const manualDelete = (
  id: string,
  type: BoardObjects,
  parent: { id: string; type: BoardObjects },
  state: StoreState
) => {
  switch (type) {
    case BoardObjects.BOARD:
      deleteBoard(id, parent, state);
      break;
    case BoardObjects.COLUMN:
      deleteColumn(id, parent, state);
      break;
    default:
      deleteOther(id, type, parent);
      break;
  }
};

const deleteBoard = (
  id: string,
  parent: { id: string; type: BoardObjects },
  state: StoreState
) => {
  const board = state.boards[id];
  if (!board) return;

  board.childRefs.forEach(({ childId, childType }) => {
    manualDelete(childId, childType, { id: board.id, type: board.type }, state);
  });

  store.dispatch(
    removeChild.action({ id: parent.id, type: parent.type, cId: id })
  );
  store.dispatch(removeNode.action({ id, type: BoardObjects.BOARD }));
};

const deleteColumn = (
  id: string,
  parent: { id: string; type: BoardObjects },
  state: StoreState
) => {
  const column = state.columns[id];
  if (!column) return;

  column.childRefs.forEach(({ childId, childType }) => {
    manualDelete(
      childId,
      childType,
      { id: column.id, type: column.type },
      state
    );
  });

  store.dispatch(
    removeChild.action({ id: parent.id, type: parent.type, cId: id })
  );
  store.dispatch(removeNode.action({ id, type: BoardObjects.COLUMN }));
};

// note, task, picture, document
const deleteOther = (
  id: string,
  type: BoardObjects,
  parent: { id: string; type: BoardObjects }
) => {
  store.dispatch(
    removeChild.action({ id: parent.id, type: parent.type, cId: id })
  );
  store.dispatch(removeNode.action({ id, type }));
};

//#endregion

//#region Copy functions

const copySelection = (boardId: string, x: number, y: number) => {
  const state = store.getState();
  store.dispatch(clearCopiedNodes(undefined));
  store.dispatch(setPosition({ x, y }));
  Object.values(state.selection).forEach(
    ({ id, type }: { id: string; type: BoardObjects }) => {
      manualCopy(id, type, state);
    }
  );
};

const manualCopy = (id: string, type: BoardObjects, state: StoreState) => {
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
const copyBoard = (id: string, state: StoreState) => {
  const board = state.boards[id];
  if (!board) return;

  board.childRefs.forEach(({ childId, childType }) => {
    manualCopy(childId, childType, state);
  });
  store.dispatch(addCopyNode(board));
};

// column
const copyColumn = (id: string, state: StoreState) => {
  const column = state.columns[id];
  if (!column) return;

  column.childRefs.forEach(({ childId, childType }) => {
    manualCopy(childId, childType, state);
  });
  store.dispatch(addCopyNode(column));
};

// note, task, picture, document
const copyOther = (id: string, type: BoardObjects, state: StoreState) => {
  if (!state) return;
  const node = state[type + "s"][id];
  if (!node) return;
  store.dispatch(addCopyNode(node));
};

//#endregion

//#region Paste functions

const pasteToSelectedNodes = (boardId: string, x: number, y: number) => {
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
  state: StoreState,
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

export function useContextMenu({ boardId, containerRef, calculatePosition }) {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const selectedNodes = useSelector((state: StoreState) => state.selection);
  const contextMenu = useSelector((state: StoreState) => {
    const types = Object.values(state.selection).map((node) => node.type);
    return reduceContextMenu(types);
  });

  const handleRightClick = (event) => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;
    // open context menu at mouse pos
    setMousePos({ x: mouseX, y: mouseY });

    setIsOpen(true);
  };

  const ContextMenu = () => {
    const contextRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
      const handleClick = (e) => {
        if (
          e.currentTarget !== contextRef.current ||
          e.currentTarget.parentNode !== contextRef.current
        ) {
          setIsOpen(false);
        }
      };
      window.addEventListener("click", handleClick);
      return () => {
        window.removeEventListener("click", handleClick);
      };
    }, []);

    return isOpen
      ? ReactDOM.createPortal(
          <div
            className="context-menu"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: `translatex(50%)`, // reposition based on bounds
            }}
            ref={contextRef}
          >
            {contextMenu.canCopy ||
            contextMenu.canCut ||
            contextMenu.canDelete ||
            contextMenu.canPaste ? (
              <div className="context-menu-group">
                <p>Standard Node Actions</p>
                {contextMenu.canCut ? (
                  <div className="context-menu-item">Cut</div>
                ) : null}
                {contextMenu.canCopy ? (
                  <div
                    className="context-menu-item"
                    onClick={(event) => {
                      const { x, y } = calculatePosition(
                        mousePos.x,
                        mousePos.y
                      );
                      copySelection(boardId, x, y);
                    }}
                  >
                    Copy
                  </div>
                ) : null}
                {contextMenu.canDelete ? (
                  <div className="context-menu-item" onClick={deleteSelection}>
                    Delete
                  </div>
                ) : null}
                {contextMenu.canPaste ? (
                  <div
                    className="context-menu-item"
                    onClick={(event) => {
                      const { x, y } = calculatePosition(
                        mousePos.x,
                        mousePos.y
                      );
                      pasteToSelectedNodes(boardId, x, y);
                    }}
                  >
                    Paste
                  </div>
                ) : null}
              </div>
            ) : null}
            {contextMenu.items.length > 0 && (
              <div className="context-menu-group">
                <p>Exclusive Node Actions</p>
                {contextMenu.items.map(
                  (item: ContextMenuItem | NewNodeMenuItem) => {
                    return (
                      <div
                        className="context-menu-item"
                        onClick={() =>
                          item.onClick &&
                          item.onClick(boardId, mousePos.x, mousePos.y)
                        }
                      >
                        {item.label}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>,
          document.querySelector("#root")
        )
      : undefined;
  };

  return {
    handleRightClick,
    ContextMenu,
  };
}
