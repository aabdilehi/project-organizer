//#region Imports
import React, { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { connect, useDispatch } from "react-redux";

import { BoardObjects } from "../utils/enums/items";
import Note from "./Note";

import { addChild, addNode } from "../utils/slices/nodeActions";
import { bindActionCreators } from "redux";

import { useDrop } from "../utils/hooks/useDrop";
import { useSmoothBoardControls } from "../utils/hooks/useSmoothBoardControls";
import { withRouter } from "./Modular/ComponentWithRouterProp.jsx";
import { useContextMenu } from "../utils/hooks/useContextMenu.tsx";
import { NoteC } from "../utils/classes/classes";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
import Column from "./Column";
import { clearSelectNode } from "../utils/slices/selectionSlice";
import BoardIcon from "./BoardIcon.jsx";
import Document from "./Document.jsx";
import Task from "./Task.jsx";
import DragLayer from "./DragLayer.tsx";
//#endregion

const Board = ({ validBoard, title, router, childRefs }) => {
  //#region Handle initial page setup
  const { id } = router.params;
  const boardId = id ? id : "root";

  const dispatch = useDispatch();

  //#region References
  const ref = useRef();
  const transformRef = useRef();
  //#endregion

  const calculateRelativePosition = (x, y) => {
    const boundingRect = ref.current.getBoundingClientRect();
    const newX = (x - boundingRect.left) / scale - position.x;
    const newY = (y - boundingRect.top) / scale - position.y;

    return {
      x: newX,
      y: newY,
    };
  };

  const calculateAbsolutePosition = (x, y) => {
    const boundingRect = ref.current.getBoundingClientRect();
    const newX = x + position.x;
    const newY = y + position.y;

    return {
      x: newX,
      y: newY,
    };
  };

  const getMouse = (e) => {
    return calculateRelativePosition(e.clientX, e.clientY);
  };

  const handleDoubleClick = (e) => {
    if (e.target !== ref.current && e.target.parentNode !== ref.current) {
      return;
    }

    const { x: mouseX, y: mouseY } = getMouse(e);
    const newNote = new NoteC({
      pX: mouseX,
      pY: mouseY,
      parent: {
        id: boardId,
        type: BoardObjects.BOARD,
      },
    });
    dispatch(addNode.action(newNote));
    dispatch(
      addChild.action({
        id: boardId,
        type: BoardObjects.BOARD,
        cId: newNote.id,
        cType: newNote.type,
      })
    );
  };

  //#region Pan and zoom behaviour
  const { handleWheel, handleMouseDown, scale, position } =
    useSmoothBoardControls(boardId, transformRef, ref);

  //#endregion

  //#region Drag behaviour

  // const { handleDragStart, handleDrag, clearPortal, draggedNodes } =
  //   useSmoothDrag({
  //     boardRef: ref,
  //     transformRef: transformRef,
  //     offset: position,
  //     scale,
  //   });

  //#endregion

  //#region Drop behaviour
  const { dropOnBoard, dropOnColumn, allowDropOnBoard, allowDropOnColumn } =
    useDrop({
      boardRef: ref,
      scale,
    });
  //#endregion

  //#region Context Menu
  const { handleRightClick, ContextMenu } = useContextMenu({
    boardId,
    containerRef: ref,
    calculatePosition: calculateRelativePosition,
  });
  //#endregion

  //#region Render board
  if (validBoard) {
    return (
      <>
        <DragLayer boardRef={ref} transformRef={transformRef} scale={scale} />
        <div
          ref={ref}
          className="actualboard"
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
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
          onDrop={(event) => {
            event.stopPropagation();
            dropOnBoard(event, boardId);
          }}
          onDragOver={(event) => {
            allowDropOnBoard(event);
          }}
          onResize={(e) => e.preventDefault()}
        >
          <ContextMenu />
          <div ref={transformRef} className="board-transform">
            {childRefs.map(({ childId, childType }) => {
              switch (childType) {
                case BoardObjects.NOTE:
                  return (
                    <Note
                      key={childId}
                      id={childId}
                      onContextMenu={handleRightClick}
                    />
                  );
                case BoardObjects.TASK:
                  return (
                    <Task
                      key={childId}
                      id={childId}
                      onContextMenu={handleRightClick}
                    />
                  );
                case BoardObjects.COLUMN:
                  return (
                    <Column
                      key={childId}
                      id={childId}
                      drop={dropOnColumn}
                      allowDrop={allowDropOnColumn}
                      dropOnBoard={dropOnBoard}
                      allowDropOnBoard={allowDropOnBoard}
                      onContextMenu={handleRightClick}
                    />
                  );
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
  if (board) {
    return {
      validBoard: true,
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

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Board));
