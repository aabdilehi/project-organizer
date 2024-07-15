import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ContextMenuItem,
  NewNodeMenuItem,
  reduceContextMenu,
} from "../context-menu-types";
import { store } from "../../store";
import { removeChild, removeNode } from "../slices/nodeActions";
import { BoardObjects } from "../enums/items";
import { addCopyNode, clearCopiedNodes } from "../slices/copiedSlice";
import { EmptyObject, Store } from "redux";
import { PersistPartial } from "redux-persist/es/persistReducer";
import React from "react";

// So long and appears so frequently that it is probably better to do this
type StoreState = EmptyObject & {
  boards: {
    root: {
      id: string;
      title: string;
      childRefs: never[];
    };
  };
  columns: {};
  notes: {};
  pictures: {};
  tasks: {};
  documents: {};
  selection: {};
  copied: never[];
} & PersistPartial;

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
const copySelection = () => {
  const state = store.getState();
  store.dispatch(clearCopiedNodes);
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

export function useContextMenu({ boardId, containerRef }) {
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

    return isOpen ? (
      <div
        className="context-menu"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
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
              <div className="context-menu-item" onClick={copySelection}>
                Copy
              </div>
            ) : null}
            {contextMenu.canDelete ? (
              <div className="context-menu-item" onClick={deleteSelection}>
                Delete
              </div>
            ) : null}
            {contextMenu.canPaste ? (
              <div className="context-menu-item">Paste</div>
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
      </div>
    ) : undefined;
  };

  return {
    handleRightClick,
    ContextMenu,
  };
}
