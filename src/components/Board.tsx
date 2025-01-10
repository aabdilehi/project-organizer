//#region Imports
import React, { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";

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
//#endregion

const Board = ({
  validBoard,
  title,
  boardId,
  router,
  childRefs,
  offset,
  scale,
  clearSelectNode,
  handleMouseDown,
  handleWheel,
}) => {
  //#region Handle initial page setup
  //#region References
  const ref = useRef();
  const transformRef = useRef();
  const currentPosition = useRef(offset);
  const currentScale = useRef(scale);
  const currentMousePos = useRef({ x: 0, y: 0 });
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  //#endregion

  const handleRightClick = useCallback((event) => {
    event.preventDefault();
    const boundingRect = ref.current.getBoundingClientRect();
    const x = event.clientX - boundingRect.left;
    const y = event.clientY - boundingRect.top;
    // open context menu at mouse pos
    currentMousePos.current = { x, y };

    setContextMenuOpen(true);
  }, []);

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
  if (validBoard) {
    return (
      <>
        <div
          ref={ref}
          draggable={true}
          className="actualboard"
          onMouseDown={(event) =>
            handleMouseDown(
              event,
              ref,
              transformRef,
              currentPosition,
              currentScale
            )
          }
          style={{
            backgroundSize: `${100 * currentScale.current}px ${
              100 * currentScale.current
            }px`,
            backgroundPosition: `${currentPosition.current.x}px ${currentPosition.current.y}px`,
          }}
          onWheel={(event) =>
            handleWheel(event, ref, transformRef, currentPosition, currentScale)
          }
          onClick={(e) => {
            if (e.target == transformRef.current || e.target == ref.current) {
              clearSelectNode();
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (e.target == transformRef.current || e.target == ref.current) {
              clearSelectNode();
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
  }
  //#endregion
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.router.params;
  const boardId = id ? id : "root";
  const board = state.boards[boardId];
  const nodes = {
    ...state.boards,
    ...state.columns,
    ...state.documents,
    ...state.notes,
    ...state.tasks,
  };
  if (board) {
    return {
      nodes,
      selectedNodes: state.selection,
      copyPosition: state.copied.position,
      copiedNodes: state.copied.copiedNodes,
      validBoard: true,
      boardId,
      title: board.title,
      childRefs: board.childRefs,
      parent: board.parent,
      offset: board.offset,
      scale: board.scale,
    };
  }
  return {
    validBoard: false,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  // Delete functions
  const deleteSelection = (
    selection: {
      [id: string]: {
        id: string;
        type: BoardObjects;
        parent: {
          id: string;
          type: BoardObjects;
        };
      };
    },
    nodes: { [id: string]: any }
  ) => {
    Object.values(selection).forEach(
      ({
        id,
        type,
        parent,
      }: {
        id: string;
        type: BoardObjects;
        parent: { id: string; type: BoardObjects };
      }) => {
        manualDelete(id, type, parent, nodes);
      }
    );
  };

  const manualDelete = (
    id: string,
    type: BoardObjects,
    parent: { id: string; type: BoardObjects },
    nodes: { [id: string]: any }
  ) => {
    switch (type) {
      case BoardObjects.BOARD:
      case BoardObjects.COLUMN:
        deleteContainer(id, parent, nodes);
        break;
      default:
        deleteOther(id, type, parent);
        break;
    }
  };

  const deleteContainer = (
    id: string,
    parent: { id: string; type: BoardObjects },
    nodes: { [id: string]: any }
  ) => {
    const board = nodes[id];
    if (!board) return;

    board.childRefs.forEach(({ childId, childType }) => {
      manualDelete(
        childId,
        childType,
        { id: board.id, type: board.type },
        nodes
      );
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
  //

  // Copy functions
  const copySelection = (selection, nodes, x?: number, y?: number) => {
    if (x && y) {
      dispatch(setPosition({ x, y }));
    } else {
      let centroidX = 0;
      let centroidY = 0;
      let centroidCount = 0;
      Object.values(selection).forEach((sel) => {
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
    Object.values(selection).forEach(({ id }: { id: string }) => {
      manualCopy(id, nodes);
    });
  };

  const manualCopy = (id: string, nodes) => {
    const node = nodes[id];
    if (!node) return;

    if (node.hasOwnProperty("childRefs")) {
      node.childRefs.forEach(({ childId }) => {
        manualCopy(childId, nodes);
      });
    }

    dispatch(addCopyNode(node));
  };
  //

  // Paste functions

  const pasteToSelectedNodes = (
    selection,
    position,
    copiedNodes,
    boardId: string,
    x?: number,
    y?: number
  ) => {
    if (Object.values(selection).length <= 0) {
      duplicateCopiedNodes(
        boardId,
        BoardObjects.BOARD,
        position,
        copiedNodes,
        boardId,
        x,
        y
      );
    } else {
      Object.values(selection).forEach(
        ({ id, type }: { id: string; type: BoardObjects }) => {
          duplicateCopiedNodes(id, type, position, copiedNodes, boardId, x, y);
        }
      );
    }
  };

  const duplicateCopiedNodes = (
    id: string,
    type: BoardObjects,
    position,
    copiedNodes,
    boardId: string,
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
        pX: item.pX - position.x + x,
        pY: item.pY - position.y + y,
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
  //

  let wheelEventEndTimeout;
  const handleWheel = (
    event,
    boardId,
    boardRef,
    transformRef,
    currentPosition,
    currentScale,
    scale
  ) => {
    if (
      event.target === boardRef.current ||
      event.target.parentNode === boardRef.current
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

        boardRef.current.style.backgroundSize = `${
          100 * currentScale.current
        }px ${100 * currentScale.current}px`;
        boardRef.current.style.backgroundPosition = `${currentPosition.current.x}px ${currentPosition.current.y}px`;
        // This should be changed as you cannot pan and scale at the same time rn
      });
    }
  };
  return {
    clearSelectNode: () => dispatch(clearSelectNode()),
    deleteSelection,
    copySelection,
    pasteToSelectedNodes,
    handleWheel,
    handleMouseUp: (event, boardId, startX, startY) => {
      dispatch(
        updateOffset({
          id: boardId,
          x: event.pageX - startX,
          y: event.pageY - startY,
        })
      );
    },
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    handleSelect: dispatchProps.handleSelect,
    updateSelectData: () => {
      dispatchProps.updateSelectData(
        stateProps.selected,
        stateProps.selectData
      );
    },
    clearSelectNode: dispatchProps.clearSelectNode,
    deleteSelection: () =>
      dispatchProps.deleteSelection(stateProps.selection, stateProps.nodes),
    copySelection: (x?: number, y?: number) =>
      dispatchProps.copySelection(
        stateProps.selectedNodes,
        stateProps.nodes,
        x,
        y
      ),
    pasteToSelectedNodes: (boardId: string, x?: number, y?: number) =>
      dispatchProps.pasteToSelectedNodes(
        stateProps.selectedNodes,
        stateProps.copyPosition,
        stateProps.copiedNodes,
        boardId,
        x,
        y
      ),
    handleMouseDown: (
      event,
      boardRef,
      transformRef,
      currentPosition,
      currentScale
    ) => {
      console.log(stateProps.boardId);
      if (event.type == "mousedown") {
        if (
          event.target !== boardRef.current &&
          event.target !== transformRef.current
        )
          return;

        // Begin panning if user middle clicks on board
        if (event.button === 1) {
          event.preventDefault();
          console.log(currentPosition);
          const startX = event.pageX - stateProps.offset.x;
          const startY = event.pageY - stateProps.offset.y;
          const bounds = transformRef.current.getBoundingClientRect();
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
                boardRef.current.style.backgroundSize = `${
                  100 * currentScale.current
                }px ${100 * currentScale.current}px`;
                boardRef.current.style.backgroundPosition = `${currentPosition.current.x}px ${currentPosition.current.y}px`;
              });
            }
          };

          const handleMouseUp = (event) => {
            console.log(event.pageX - startX);
            // Clear selection if user left clicks on board
            if (event.button === 0) {
              dispatchProps.clearSelectNode();
            }
            dispatchProps.handleMouseUp(
              event,
              stateProps.boardId,
              startX,
              startY
            );
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }
        return;
      }
    },
    handleWheel: (
      event,
      boardRef,
      transformRef,
      currentPosition,
      currentScale
    ) =>
      dispatchProps.handleWheel(
        event,
        stateProps.boardId,
        boardRef,
        transformRef,
        currentPosition,
        currentScale,
        stateProps.scale
      ),
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(Board)
);
