//#region Imports
import React, { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { connect, useDispatch, useSelector } from "react-redux";

import { BoardObjects } from "../utils/enums/items.tsx";
import Note from "./Note.jsx";

import {
  addChild,
  addNode,
  removeChild,
  removeNode,
} from "../utils/slices/nodeActions.ts";

import { useDrop } from "../utils/hooks/useDrop.jsx";
import { withRouter } from "./Modular/ComponentWithRouterProp.jsx";
import { useContextMenu } from "../utils/hooks/useContextMenu.tsx";
import Column from "./Column.jsx";
import { clearSelectNode } from "../utils/slices/selectionSlice.js";
import BoardIcon from "./BoardIcon.jsx";
import Document from "./Document.jsx";
import Task from "./Task.jsx";
import DragLayer from "./DragLayer.tsx";
import { updateOffset, updateScale } from "../utils/slices/boardSlice.js";
import {
  addCopyNode,
  clearCopiedNodes,
  setPosition,
} from "../utils/slices/copiedSlice.ts";
import ContextMenu from "../utils/hooks/ContextMenu.tsx";
import Group from "./Group.jsx";
import {
  selectBoard,
  selectBoardChildren,
  selectBoardOffset,
  selectBoardParent,
  selectBoardScale,
  selectBoardTitle,
  selectCopiedNodes,
  selectCopiedPosition,
  selectNodes,
  selectSelection,
} from "../utils/slices/selectors.ts";
import { RootState } from "../store.ts";
//#endregion

const Board = ({ validBoard, router }) => {
  //#region Handle initial page setup
  const { id } = router.params;
  const boardId = id ? id : "root";

  //#region Selectors

  const scale = useSelector((state: RootState) =>
    selectBoardScale(state, boardId)
  );
  const offset = useSelector((state: RootState) =>
    selectBoardOffset(state, boardId)
  );
  const childRefs = useSelector((state: RootState) =>
    selectBoardChildren(state, boardId)
  );

  const nodes = useSelector(selectNodes);

  if (!nodes[boardId]) return;

  const selectedNodes = useSelector(selectSelection);
  const copiedNodes = useSelector(selectCopiedNodes);
  const copiedPosition = useSelector(selectCopiedPosition);

  //#endregion

  //#region References
  const ref = useRef();
  const transformRef = useRef();
  const currentPosition = useRef(offset);
  const currentScale = useRef(scale);
  const currentMousePos = useRef({ x: 0, y: 0 });
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  //#endregion

  //#region Dispatch actions

  const dispatch = useDispatch();

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
    if (x && y) {
      dispatch(setPosition({ x, y }));
    } else {
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
    Object.values(selectedNodes).forEach(({ id }: { id: string }) => {
      manualCopy(id);
    });
  };

  const manualCopy = (id: string) => {
    const node = nodes[id];
    if (!node) return;

    if (node.hasOwnProperty("childRefs")) {
      node.childRefs.forEach(({ childId }) => {
        manualCopy(childId);
      });
    }

    dispatch(addCopyNode(node));
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

  let wheelEventEndTimeout;
  const handleWheel = (event) => {
    if (
      event.target === ref.current ||
      event.target.parentNode === ref.current
    ) {
      if (wheelEventEndTimeout == undefined) {
        currentScale.current = scale;
      }
      clearTimeout(wheelEventEndTimeout);
      wheelEventEndTimeout = setTimeout(() => {
        dispatch(
          updateScale({
            id: boardId,
            scale: currentScale.current,
          })
        );
        wheelEventEndTimeout = undefined;
      }, 100);

      const newScale = Math.max(
        0.05,
        currentScale.current + event.deltaY * -0.0025
      );
      currentScale.current += (newScale - currentScale.current) * 0.2;
      console.log(currentScale.current);

      requestAnimationFrame(() => {
        transformRef.current.style.transform = `scale(${
          currentScale.current
        }) translate(${currentPosition.current.x / currentScale.current}px, ${
          currentPosition.current.y / currentScale.current
        }px)`;

        ref.current.style.backgroundSize = `${100 * currentScale.current}px ${
          100 * currentScale.current
        }px`;
        ref.current.style.backgroundPosition = `${currentPosition.current.x}px ${currentPosition.current.y}px`;
        // This should be changed as you cannot pan and scale at the same time rn
      });
    }
  };

  const handleRightClick = useCallback((event) => {
    event.preventDefault();
    const boundingRect = ref.current.getBoundingClientRect();
    const x = event.clientX - boundingRect.left;
    const y = event.clientY - boundingRect.top;
    // open context menu at mouse pos
    currentMousePos.current = { x, y };

    setContextMenuOpen(true);
  }, []);

  const handleMouseDown = (event) => {
    if (event.type == "mousedown") {
      if (event.target !== ref.current && event.target !== transformRef.current)
        return;

      // Begin panning if user middle clicks on board
      if (event.button === 1) {
        event.preventDefault();
        const startX = event.pageX - offset.x;
        const startY = event.pageY - offset.y;
        const handleMouseMove = (event) => {
          event.preventDefault();
          if (
            transformRef.current !== null &&
            currentPosition.current !== null
          ) {
            currentPosition.current = {
              x: event.pageX - startX,
              y: event.pageY - startY,
            };

            requestAnimationFrame(() => {
              transformRef.current.style.transform = `scale(${
                currentScale.current
              }) translate(${
                currentPosition.current.x / currentScale.current
              }px, ${currentPosition.current.y / currentScale.current}px)`;
              ref.current.style.backgroundSize = `${
                100 * currentScale.current
              }px ${100 * currentScale.current}px`;
              ref.current.style.backgroundPosition = `${currentPosition.current.x}px ${currentPosition.current.y}px`;
            });
          }
        };

        const handleMouseUp = (event) => {
          console.log(event.pageX - startX);
          // Clear selection if user left clicks on board
          if (event.button === 0) {
            dispatch(clearSelectNode());
          }
          dispatch(
            updateOffset({
              id: boardId,
              x: event.pageX - startX,
              y: event.pageY - startY,
            })
          );
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }
      return;
    }
  };

  const calculateRelativePosition = (x, y) => {
    const newX = (x - currentPosition.current.x) / currentScale.current;
    const newY = (y - currentPosition.current.y) / currentScale.current;

    return {
      x: newX,
      y: newY,
    };
  };

  //#endregion

  //#region Drop behaviour
  const { dropOnBoard, dropOnColumn, allowDropOnBoard, allowDropOnColumn } =
    useDrop({
      boardRef: ref,
      scale: currentScale,
      offset: currentPosition,
    });
  //#endregion

  function openContextMenu(open: boolean) {
    setContextMenuOpen(open);
  }

  //#region Render board
  return (
    <>
      <div
        ref={ref}
        draggable={true}
        className="actualboard"
        onMouseDown={(event) => handleMouseDown(event)}
        style={{
          backgroundSize: `${100 * currentScale.current}px ${
            100 * currentScale.current
          }px`,
          backgroundPosition: `${currentPosition.current.x}px ${currentPosition.current.y}px`,
        }}
        onWheel={(event) => handleWheel(event)}
        onClick={(e) => {
          if (e.target == transformRef.current || e.target == ref.current) {
            dispatch(clearSelectNode());
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (e.target == transformRef.current || e.target == ref.current) {
            dispatch(clearSelectNode());
          }
          handleRightClick(e);
        }}
        onDragStart={(event) => {
          if (event.dataTransfer.types.length > 0) return;
          event.dataTransfer.setData("origin/board", "");
          event.dataTransfer.setData("action/select", "");
        }}
        onDrop={(event) => {
          event.stopPropagation();
          dropOnBoard(event, boardId);
        }}
        onDragOver={(event) => {
          allowDropOnBoard(event);
        }}
        onResize={(e) => e.preventDefault()}
      >
        <DragLayer
          boardId={boardId}
          boardRef={ref}
          transformRef={transformRef}
          scale={currentScale}
          offset={currentPosition}
        />
        <ContextMenu
          boardId={boardId}
          open={contextMenuOpen}
          setOpen={openContextMenu}
          mousePosition={currentMousePos}
          calculatePosition={calculateRelativePosition}
        />
        <div
          ref={transformRef}
          className="board-transform"
          style={{
            transform: `scale(${currentScale.current}) translate(${
              currentPosition.current.x / currentScale.current
            }px, ${currentPosition.current.y / currentScale.current}px)`,
          }}
        >
          {childRefs.map(({ childId, childType }) => {
            switch (childType) {
              case BoardObjects.NOTE:
                return (
                  <Note
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale.current}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.TASK:
                return (
                  <Task
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale.current}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.GROUP:
                return (
                  <Group
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale.current}
                    offset={currentPosition}
                  />
                );
              // case BoardObjects.COLUMN:
              //   return (
              //     <Column
              //       key={childId}
              //       id={childId}
              //       drop={dropOnColumn}
              //       allowDrop={allowDropOnColumn}
              //       dropOnBoard={dropOnBoard}
              //       allowDropOnBoard={allowDropOnBoard}
              //       onContextMenu={handleRightClick}
              //     />
              //   );
              case BoardObjects.BOARD:
                return (
                  <BoardIcon
                    key={childId}
                    id={childId}
                    drop={dropOnBoard}
                    allowDrop={allowDropOnBoard}
                    onContextMenu={handleRightClick}
                  />
                );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              default:
                break;
            }
          })}
        </div>
      </div>
    </>
  );

  //#endregion
};

export default withRouter(Board);
