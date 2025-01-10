/** @jsxImportSource @emotion/react */
import { useLayoutEffect, useRef, useState } from "react";
import { BoardObjects, SidebarObjects } from "../utils/enums/items";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";

import Note from "./Note";

import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import {
  addChild,
  addNode,
  removeChild,
  updateParent,
  updateTitle,
} from "../utils/slices/nodeActions";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import BoardIcon from "./BoardIcon.jsx";
import Document from "./Document.jsx";
import Task from "./Task.jsx";
import {
  BoardClass,
  ColumnClass,
  DocumentClass,
  NoteClass,
  TaskClass,
} from "../utils/classes/new-classes.ts";
import { PictureC } from "../utils/classes/classes.js";

const previewStyle = {
  fontWeight: "800",
  borderRadius: "10px",
};

const Column = ({
  id,
  pX,
  pY,
  sX,
  title,
  childRefs,
  parent,
  drop,
  onContextMenu,
  onDragStart,
  dropOnBoard,
  allowDropOnBoard,
  ...props
}) => {
  const nodeRef = useRef();
  const columnRef = useRef();

  const selectedNodes = useSelector((state) => state.selection);

  const [activeDropZone, setDropZoneActive] = useState(false);

  // Really annoying as this event sucks at bubbling properly so i have to do this

  const onDragOver = (event) => {
    if (
      event.target == nodeRef.current ||
      nodeRef.current.contains(event.target)
    ) {
      setDropZoneActive(true);
    } else {
      setDropZoneActive(false);
    }
  };

  useLayoutEffect(() => {
    if (nodeRef.current) {
      window.addEventListener("dragenter", onDragOver);
    }
    return () => {
      if (nodeRef.current) {
        window.removeEventListener("dragenter", onDragOver);
      }
    };
  }, []);

  //#endregion

  const allowDrop = (event) => {
    if (event.dataTransfer.types.length <= 0) return;

    switch (event.dataTransfer.types[0]) {
      case "origin/sidebar":
      case "origin/board":
        //case "text/plain": // can make note node for this
        // assume sidebar if no dragged nodes (can probably add validation but eh)
        event.stopPropagation();
        event.preventDefault();
      default:
        return;
    }
  };

  return (
    <NodeWrapper
      ref={nodeRef}
      canPosition={true}
      canResize={false}
      id={id}
      type={"column"}
      parentId={parent.id}
      parentType={parent.type}
      pX={pX}
      pY={pY}
      sX={sX}
      onDragOver={(event) => {
        if (!allowDrop) return;
        allowDrop(event, id);
      }}
      onDrop={(event) => {
        if (!drop) return;
        drop(event, id);
      }}
      onContextMenu={onContextMenu}
    >
      <CustomEditablePreview
        as={"h1"}
        canEdit={!!selectedNodes[id]}
        text={title}
        width={sX}
        textStyle={previewStyle}
        onChange={props.onChange}
      />
      <span
        ref={columnRef}
        style={{
          width: "100%",
          alignItems: "center",
          border: "2px dashed grey",
          borderRadius: "8px",
          minHeight: childRefs.length > 0 ? undefined : "80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {childRefs.map(({ childId, childType }) => {
          switch (childType) {
            case BoardObjects.NOTE:
              return (
                <Note
                  key={childId}
                  id={childId}
                  onContextMenu={onContextMenu}
                  columnWidth={sX}
                />
              );
            case BoardObjects.TASK:
              return (
                <Task
                  key={childId}
                  id={childId}
                  onContextMenu={onContextMenu}
                  columnWidth={sX}
                />
              );
            case BoardObjects.BOARD:
              return (
                <BoardIcon
                  key={childId}
                  id={childId}
                  drop={dropOnBoard}
                  allowDrop={allowDropOnBoard}
                  onContextMenu={onContextMenu}
                  columnWidth={sX}
                />
              );
            case BoardObjects.DOCUMENT:
              return (
                <Document
                  key={childId}
                  id={childId}
                  onContextMenu={onContextMenu}
                  columnWidth={sX}
                />
              );
            default:
              break;
          }
        })}
      </span>
    </NodeWrapper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const column = state.columns[id];

  return {
    title: column.title,
    childRefs: column.childRefs,
    pX: column.pX,
    pY: column.pY,
    sX: column.sX,
    parent: column.parent,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChange: (value) =>
      dispatch(
        updateTitle.action({
          id: ownProps.id,
          type: BoardObjects.COLUMN,
          title: value,
        })
      ),
    createNode: (event, boardRef, data, pId, pType) => {
      if (boardRef.current == null) return;
      const boundingRect = boardRef.current.getBoundingClientRect();
      const xCoord = event.clientX - boundingRect.left;
      const yCoord = event.clientY - boundingRect.top;
      let node;

      switch (data.type) {
        case SidebarObjects.NOTE:
          node = new NoteClass({
            pX: xCoord,
            pY: yCoord,
            parent: {
              id: pId,
              type: pType,
            },
          }).serialize();
          break;
        case SidebarObjects.IMAGE:
          node = new PictureC({
            pX: xCoord,
            pY: yCoord,
            parent: {
              id: pId,
              type: pType,
            },
          });
          break;

        case SidebarObjects.TASK:
          node = new TaskClass({
            pX: xCoord,
            pY: yCoord,
            parent: {
              id: pId,
              type: pType,
            },
          }).serialize();
          break;
        case SidebarObjects.BOARD:
          node = new BoardClass({
            pX: xCoord,
            pY: yCoord,
            parent: {
              id: pId,
              type: pType,
            },
          }).serialize();
          break;
        case SidebarObjects.COLUMN:
          node = new ColumnClass({
            pX: xCoord,
            pY: yCoord,
            parent: {
              id: pId,
              type: pType,
            },
          }).serialize();
          break;
        case SidebarObjects.DOCUMENT:
          node = new DocumentClass({
            pX: xCoord,
            pY: yCoord,
            parent: {
              id: pId,
              type: pType,
            },
          }).serialize();
          break;
      }

      if (!!node) {
        dispatch(addNode.action(node));
        dispatch(
          addChild.action({
            id: pId,
            type: pType,
            cId: node.id,
            cType: node.type,
          })
        );
      }
    },
    updateNodeParent: (data, pId, pType) => {
      console.log(data);

      dispatch(
        updateParent.action({
          id: data.id,
          type: data.type,
          parent: {
            id: pId,
            type: pType,
          },
        })
      );
      dispatch(
        removeChild.action({
          id: data.parent.id,
          type: data.parent.type,
          cId: data.id,
        })
      );
      dispatch(
        addChild.action({
          id: pId,
          type: pType,
          cId: data.id,
          cType: data.type,
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Column);
