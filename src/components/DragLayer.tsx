import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { StoreState } from "../utils/enums/state-type";
import { BoardObjects, SidebarObjects } from "../utils/enums/items";
import NotePreview from "./NotePreview";
import ColumnPreview from "./ColumnPreview";
import { clearDragData, setDragData } from "../utils/slices/dragSlice";
import TaskPreview from "./TaskPreview";
import BoardIconPreview from "./BoardIconPreview";
import DocumentPreview from "./DocumentPreview";

const DragLayer = ({
  boardRef,
  transformRef,
  scale,
  offset,
  ...props
}: {
  boardRef: React.MutableRefObject<HTMLDivElement>;
  transformRef: React.MutableRefObject<HTMLDivElement>;
  offset: { x: number; y: number };
  scale: number;
}) => {
  const dragLayerRef = useRef<HTMLDivElement>();

  const handleDragStart = (event) => props.handleDragStart(event, dragLayerRef);
  const handleDrag = (event) => props.handleDrag(event, dragLayerRef);
  useEffect(() => {
    if (!window || !boardRef) return;
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("drag", handleDrag);
    window.addEventListener("dragend", props.clearDragData);
    boardRef.current.addEventListener("drop", props.clearDragData);

    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("drag", handleDrag);
      window.removeEventListener("dragend", props.clearDragData);
      boardRef.current.removeEventListener("drop", props.clearDragData);
    };
  }, [props.nodes, props.draggedNodes]);

  return (
    <div ref={dragLayerRef} className="clone-container">
      {Object.values(props.draggedNodes).map(({ id, type }) => {
        switch (type) {
          case BoardObjects.NOTE:
            return <NotePreview key={id} id={id} />;
          case BoardObjects.COLUMN:
            return <ColumnPreview key={id} id={id} />;
          case BoardObjects.TASK:
            return <TaskPreview key={id} id={id} />;
          case BoardObjects.BOARD:
            return <BoardIconPreview key={id} id={id} />;
          case BoardObjects.DOCUMENT:
            return <DocumentPreview key={id} id={id} />;
          default:
            break;
        }
      })}
    </div>
  );
};
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setDragData: (data) => dispatch(setDragData(data)),
    clearDragData: () => dispatch(clearDragData()),
    handleDragStart: (event, dragLayer, selectedNodes, nodes, setDragData) => {
      event.stopPropagation();

      if (!ownProps.boardRef.current || !ownProps.transformRef.current) {
        return;
      }

      if (!dragLayer.current) return;
      requestAnimationFrame(() => {
        dragLayer.current.style.transform =
          ownProps.transformRef.current.style.transform = `scale(${
            ownProps.scale.current
          }) translate(${
            ownProps.offset.current.x / ownProps.scale.current
          }px, ${ownProps.offset.current.y / ownProps.scale.current}px)`;
      });

      console.log(event.dataTransfer.types);

      // Sidebar sets this data before the event bubbles
      // So if the drag event data is already set, ignore the rest
      if (event.dataTransfer.types.length > 0) return;

      const selectedNodeOffsets = {};
      Object.values(selectedNodes).map((item) => {
        if (!item) return;

        const x = nodes[item.id].pX;
        const y = nodes[item.id].pY;
        selectedNodeOffsets[item.id] = {
          ...selectedNodes[item.id],
          offset: {
            x: x,
            y: y,
          },
        };
      });

      // hide drag preview image
      const prev = document.createElement("span");
      prev.style.display = "none";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setDragImage(prev, 0, 0);
      event.dataTransfer.setData(
        "custom/board",
        JSON.stringify({
          initial: {
            x: event.clientX,
            y: event.clientY,
          },
          selectedNodes: selectedNodeOffsets,
        })
      );

      setDragData({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: selectedNodes,
      });
    },
    handleDrag: (event, dragLayer, initialPosition) => {
      if (!dragLayer.current) return;

      requestAnimationFrame(() => {
        dragLayer.current.style.transform = `scale(${
          ownProps.scale.current
        }) translate(${
          (event.clientX - initialPosition.x + ownProps.offset.current.x) /
          ownProps.scale.current
        }px, ${
          (event.clientY - initialPosition.y + ownProps.offset.current.y) /
          ownProps.scale.current
        }px)`;
      });
    },
  };
};

const mapStateToProps = (state: StoreState, ownProps) => {
  const nodes = {
    ...state.boards,
    ...state.columns,
    ...state.notes,
    ...state.pictures,
    ...state.tasks,
    ...state.documents,
  };
  return {
    selectedNodes: state.selection,
    initialPosition: state.drag.initialPosition,
    draggedNodes: state.drag.nodes,
    nodes,
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    clearDragData: dispatchProps.clearDragData,
    handleDragStart: (event, dragLayer) => {
      dispatchProps.handleDragStart(
        event,
        dragLayer,
        stateProps.selectedNodes,
        stateProps.nodes,
        dispatchProps.setDragData
      );
    },
    handleDrag: (event, dragLayer) => {
      dispatchProps.handleDrag(event, dragLayer, stateProps.initialPosition);
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(DragLayer);
