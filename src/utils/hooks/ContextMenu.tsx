import { useEffect, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { ContextMenuItem, reduceContextMenu } from "../context-menu-types";
import React from "react";
import ReactDOM from "react-dom";
import { BoardObjects } from "../enums/items";
import {
  setPosition,
  clearCopiedNodes,
  addCopyNode,
  copyNodeData,
} from "../slices/copiedSlice";
import {
  removeChild,
  removeNode,
  addNode,
  addChild,
} from "../slices/nodeActions";
import { v4 as uuidv4 } from "uuid";
import { updateOffset, updateScale } from "../slices/boardSlice";
import {
  selectNodes,
  selectSelection,
  selectCopiedNodes,
  selectCopiedPosition,
} from "../slices/selectors";
import { createSelector } from "@reduxjs/toolkit";

const selectedNodeTypes = createSelector([selectSelection], (selectedNodes) =>
  reduceContextMenu(Object.values(selectedNodes).map((node) => node.type))
);

const ContextMenu = ({
  boardId,
  mousePosition,
  open,
  setOpen,
  calculatePosition,
}) => {
  const contextRef = useRef();

  const nodes = useSelector(selectNodes);
  const selectedNodes = useSelector(selectSelection);
  const copiedNodes = useSelector(selectCopiedNodes);
  const copiedPosition = useSelector(selectCopiedPosition);

  const contextMenu = useSelector(selectedNodeTypes);

  const dispatch = useDispatch();

  let tempCopy: any[] = [];

  //#region Delete functions
  const deleteSelection = () => {
    Object.values(selectedNodes).forEach(
      ({
        id,
        type,
        parent,
      }: {
        id: string;
        type: BoardObjects;
        parent: { id: string; type: BoardObjects };
      }) => {
        manualDelete(id, type, parent);
      }
    );
  };

  const manualDelete = (
    id: string,
    type: BoardObjects,
    parent: { id: string; type: BoardObjects }
  ) => {
    switch (type) {
      case BoardObjects.BOARD:
      case BoardObjects.COLUMN:
        deleteContainer(id, parent);
        break;
      default:
        deleteOther(id, type, parent);
        break;
    }
  };

  const deleteContainer = (
    id: string,
    parent: { id: string; type: BoardObjects }
  ) => {
    const board = nodes[id];
    if (!board) return;

    board.childRefs.forEach(({ childId, childType }) => {
      manualDelete(childId, childType, { id: board.id, type: board.type });
    });

    dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
    dispatch(removeNode.action({ id: board.id, type: board.type }));
  };
  // note, task, picture, document
  const deleteOther = (
    id: string,
    type: BoardObjects,
    parent: { id: string; type: BoardObjects }
  ) => {
    dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
    dispatch(removeNode.action({ id, type }));
  };
  //#endregion

  //#region Copy functions
  const copySelection = (x?: number, y?: number) => {
    // Set "copy position" or "copy offset"
    // Used when pasting at new location
    if (x && y) {
      dispatch(setPosition({ x, y }));
    } else {
      // No copy position if copied using keyboard shortcut
      // Just find middle point of all copied nodes
      let centroidX = 0;
      let centroidY = 0;
      let centroidCount = 0;
      Object.values(selectedNodes).forEach((sel) => {
        if (sel.parent.type == BoardObjects.COLUMN) return;
        let node = nodes[sel.id];
        if (!node) return;
        centroidCount += 1;
        centroidX += node.pX;
        centroidY += node.pY;
      });

      const centroid = {
        x: centroidX / centroidCount,
        y: centroidY / centroidCount,
      };
      dispatch(setPosition(centroid));
    }
    dispatch(clearCopiedNodes(undefined));
    tempCopy = [];
    Object.values(selectedNodes).forEach(({ id }: { id: string }) => {
      manualCopy(id);
    });

    dispatch(copyNodeData(tempCopy));
    tempCopy = [];
  };

  const manualCopy = (id: string) => {
    const node = nodes[id];
    if (!node) return;

    if (node.hasOwnProperty("childRefs")) {
      node.childRefs.forEach(({ childId }) => {
        manualCopy(childId);
      });
    }

    tempCopy.push(node);
  };
  //#endregion

  //#region Paste functions

  const pasteToSelectedNodes = (x?: number, y?: number) => {
    if (Object.values(selectedNodes).length <= 0) {
      duplicateCopiedNodes(boardId, BoardObjects.BOARD, x, y);
    } else {
      Object.values(selectedNodes).forEach(
        ({ id, type }: { id: string; type: BoardObjects }) => {
          duplicateCopiedNodes(id, type, x, y);
        }
      );
    }
  };

  const duplicateCopiedNodes = (
    id: string,
    type: BoardObjects,
    x?: number,
    y?: number
  ) => {
    const mappedIDs = {};

    // Important to get all of them done first even though it is wasteful
    // Both the nodes, their parents, and their children need to have a corresponding ID to map to

    // I guess the copied nodes have the parent and childrefs so there is no need for two loops or even adding children?
    // Just edit the values and addNode

    Object.values(copiedNodes).forEach((item) => {
      mappedIDs[item.id] = uuidv4();
    });

    // duplicate nodes with newly assigned IDs
    Object.values(copiedNodes).forEach((item) => {
      const node = {
        ...item,
        id: mappedIDs[item.id],
        pX: item.pX - copiedPosition.x + x,
        pY: item.pY - copiedPosition.y + y,
      };

      // Check if parent's ID is in object.
      // if true, use mappedIDs to update; else assign id of node that triggered the paste
      node.parent = !!mappedIDs[node.parent.id]
        ? { ...node.parent, id: mappedIDs[node.parent.id] }
        : { id, type }; // paste node id;

      if (!node.childRefs) {
        dispatch(addNode.action(node));
        if (!mappedIDs[item.parent.id]) {
          dispatch(
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
          .filter(({ childId }) => childId !== undefined);

        dispatch(addNode.action(node));
        if (!mappedIDs[item.parent.id]) {
          if (node.type == type && type == BoardObjects.COLUMN) {
            dispatch(
              addChild.action({
                id: boardId,
                type: BoardObjects.BOARD,
                cId: node.id,
                cType: node.type,
              })
            );
          } else {
            dispatch(
              addChild.action({ id, type, cId: node.id, cType: node.type })
            );
          }
        }
      }

      return;
    });
  };
  //#endregion
  //#endregion

  const resetBoardTransform = () => {
    dispatch(updateScale({ id: boardId, scale: 1 }));
    dispatch(updateOffset({ id: boardId, x: 0, y: 0 }));
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        e.currentTarget !== contextRef.current ||
        e.currentTarget.parentNode !== contextRef.current
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return open
    ? ReactDOM.createPortal(
        <div
          className="context-menu"
          style={{
            left: `${mousePosition.current.x}px`,
            top: `${mousePosition.current.y}px`,
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
                    copySelection(event.clientX, event.clientY);
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
                    pasteToSelectedNodes(event.clientX, event.clientY);
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
                        item.onClick(
                          boardId,
                          mousePosition.current.x,
                          mousePosition.current.y
                        )
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

export default ContextMenu;
