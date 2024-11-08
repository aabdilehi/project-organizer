import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import {
  ContextMenuItem,
  NewNodeMenuItem,
  reduceContextMenu,
} from "../context-menu-types";
import React from "react";
import ReactDOM from "react-dom";
import { BoardObjects } from "../enums/items";
import {
  setPosition,
  clearCopiedNodes,
  addCopyNode,
} from "../slices/copiedSlice";
import {
  removeChild,
  removeNode,
  addNode,
  addChild,
} from "../slices/nodeActions";
import { v4 as uuidv4 } from "uuid";
import { updateOffset, updateScale } from "../slices/boardSlice";

const ContextMenu = ({
  boardId,
  mousePosition,
  open,
  setOpen,
  contextMenu,
  calculatePosition,
  copySelection,
  deleteSelection,
  pasteToSelectedNodes,
  resetBoardTransform,
  ...props
}) => {
  const contextRef = useRef();

  useEffect(() => {
    console.log(props.copyPosition);
  }, [props.copyPosition]);

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
                    const { x, y } = calculatePosition(
                      mousePosition.current.x,
                      mousePosition.current.y
                    );
                    copySelection(x, y);
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
                      mousePosition.current.x,
                      mousePosition.current.y
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

const mapStateToProps = (state, ownProps) => {
  const nodes = {
    ...state.boards,
    ...state.columns,
    ...state.documents,
    ...state.notes,
    ...state.tasks,
  };
  return {
    nodes,
    selectedNodes: state.selection,
    copyPosition: state.copied.position,
    copiedNodes: state.copied.nodes,
    contextMenu: reduceContextMenu(
      Object.values(state.selection).map((node) => node.type)
    ),
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
        [prop: string]: any;
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
    dispatch(clearCopiedNodes(undefined));
    if (!!x && !!y) {
      dispatch(setPosition({ x, y }));
    } else {
      console.log(x);
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
    console.log(position);
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
  const resetBoardTransform = () => {
    dispatch(updateScale({ id: ownProps.boardId, scale: 1 }));
    dispatch(updateOffset({ id: ownProps.boardId, x: 0, y: 0 }));
  };
  return {
    deleteSelection,
    copySelection,
    pasteToSelectedNodes,
    resetBoardTransform,
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    deleteSelection: () =>
      dispatchProps.deleteSelection(stateProps.selectedNodes, stateProps.nodes),
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
    resetBoardTransform: dispatchProps.resetBoardTransform,
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ContextMenu);
