import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { BoardObjects } from "../utils/enums/items";
import NotePreview from "./NotePreview";
import {
  clearDragData as clearDragDataAction,
  setDragData as setDragDataAction,
} from "../utils/slices/dragSlice";
import TaskPreview from "./TaskPreview";
import BoardIconPreview from "./BoardIconPreview";
import DocumentPreview from "./DocumentPreview";
import { RootState } from "../store";
import GroupPreview from "./GroupPreview";
import SelectionMarquee from "./Modular/SelectionMarquee";
import { createSelector } from "@reduxjs/toolkit";
import {
  addSelectedNodes,
  clearSelectNode,
  setSelectedNodes,
} from "../utils/slices/selectionSlice";
import {
  selectBoardChildren,
  selectDraggedNodes,
  selectInitialPosition,
  selectNodes,
  selectSelection,
  selectTypes,
} from "../utils/slices/selectors";
import ResizeMarquee from "./Modular/ResizeMarquee";
import ImagePreview from "./ImagePreview";

// Composite types used for querying intentions, e.g. instead of "origin/board", ["origin/board", "action/move"]
// I could do "board/move" but the idea is that you do if(!types.include("origin/board")) return;
// You do a preliminary check to see if you should even do anything at all and this makes that easy

// The origin is just a tag, the action contains all of the actual relevant data
const DragLayer = ({
  boardId,
  boardRef,
  transformRef,
  scale,
  offset,
  ...props
}: {
  boardId: string;
  boardRef: React.MutableRefObject<HTMLDivElement>;
  transformRef: React.MutableRefObject<HTMLDivElement>;
  offset: any;
  scale: any;
}) => {
  const dragLayerRef = useRef<HTMLDivElement>();
  //#region State props
  const nodes = useSelector(selectNodes);
  const selectedNodes = useSelector(selectSelection);

  const boardChildren = useSelector((state) =>
    selectBoardChildren(state, boardId)
  );

  //#region Select drag data
  const draggedNodes = useSelector(selectDraggedNodes);
  const initialPosition = useSelector(selectInitialPosition);
  const types = useSelector(selectTypes);
  const resize = types.includes("action/resize");
  const direction = types.find((value) => value.includes("direction"));
  //#endregion
  //#endregion

  //#region Dispatch props
  const dispatch = useDispatch();

  const clearDragData = (event) => {
    if (event.dataTransfer.types.includes("action/select")) return;
    dispatch(clearDragDataAction());
  };
  const setDragData = (data) => dispatch(setDragDataAction(data));
  const getNodeSize = (x, y, sX, sY) => {
    let newSX, newSY;
    switch (direction) {
      case "direction/left":
        newSX = sX - (x - initialPosition.x) / scale;
        newSY = sY;
        break;
      case "direction/right":
        newSX = sX + (x - initialPosition.x) / scale;
        newSY = sY;
        break;
      case "direction/top":
        newSX = sX;
        newSY = sY - (y - initialPosition.y) / scale;
        break;

      case "direction/top-left":
        newSX = sX - (x - initialPosition.x) / scale;
        newSY = sY - (y - initialPosition.y) / scale;
        break;

      case "direction/top-right":
        newSX = sX + (x - initialPosition.x) / scale;
        newSY = sY - (y - initialPosition.y) / scale;
        break;
      case "direction/bottom":
        newSX = sX;
        newSY = sY + (y - initialPosition.y) / scale;
        break;
      case "direction/bottom-left":
        newSX = sX - (x - initialPosition.x) / scale;
        newSY = sY + (y - initialPosition.y) / scale;
        break;
      case "direction/bottom-right":
        newSX = sX + (x - initialPosition.x) / scale;
        newSY = sY + (y - initialPosition.y) / scale;
        break;
      default:
        newSX = sX;
        newSY = sY;
        break;
    }
    return { x: newSX, y: newSY };
  };

  let shiftKey = false;
  let ctrlKey = false;

  const setkbdModifiers = (e) => {
    shiftKey = e.shiftKey;
    ctrlKey = e.ctrlKey;
  };
  useEffect(() => {
    window.addEventListener("keydown", setkbdModifiers);
    window.addEventListener("keyup", setkbdModifiers);
    return () => {
      window.removeEventListener("keydown", setkbdModifiers);
      window.removeEventListener("keyup", setkbdModifiers);
    };
  }, []);

  const handleDragStart = (event) => {
    if (event.dataTransfer.types.length < 0) return;

    event.stopPropagation();

    if (!boardRef.current || !transformRef.current) {
      return;
    }

    if (!dragLayerRef.current) return;
    requestAnimationFrame(() => {
      if (!dragLayerRef.current) return;
      dragLayerRef.current.style.transform =
        transformRef.current.style.transform = `scale(${scale}) translate(${
          offset.x / scale
        }px, ${offset.y / scale}px)`;
    });

    if (event.dataTransfer.types.includes("action/move")) {
      const selectedNodeData = { ...selectedNodes };
      const selectedNodeOffsets = {};
      Object.values(selectedNodeData).map((item) => {
        if (!item) return;

        if (item.type == BoardObjects.GROUP) {
          const group = nodes[item.id];
          const filteredNodes = Object.values(nodes).filter((item2) => {
            return (
              Object.hasOwn(item2, "parent") &&
              item2.parent.id == boardId &&
              item2.id !== group.id &&
              item2.pX > group.pX &&
              item2.pX < group.pX + group.sX &&
              item2.pY > group.pY &&
              item2.pY < group.pY + group.sY
            );
          });
          filteredNodes.forEach((item2) => {
            selectedNodeData[item2.id] = {
              id: item2.id,
              type: item2.type,
              parent: item2.parent,
            };
            selectedNodeOffsets[item2.id] = {
              id: item2.id,
              type: item2.type,
              parent: item2.parent,
              offset: { x: item2.pX, y: item2.pY },
            };
          });
        }
        const x = nodes[item.id].pX;
        const y = nodes[item.id].pY;
        selectedNodeOffsets[item.id] = {
          ...selectedNodeData[item.id],
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
      event.dataTransfer.setDragImage(prev, 10000, 10000);
      event.dataTransfer.setData(
        "action/move",
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
        nodes: selectedNodeData,
        types: event.dataTransfer.types,
      });
    } else if (event.dataTransfer.types.includes("action/resize")) {
      // hide drag preview image

      const selectedNodeData = {};
      Object.values(selectedNodes).forEach((item) => {
        selectedNodeData[item.id] = nodes[item.id];
      });
      const prev = document.createElement("span");
      prev.style.display = "none";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setDragImage(prev, 10000, 10000);
      event.dataTransfer.setData(
        "action/resize",
        JSON.stringify({
          initial: {
            x: event.clientX,
            y: event.clientY,
          },
          direction,
          selectedNodes: selectedNodeData,
        })
      );
      setDragData({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: selectedNodeData,
        types: event.dataTransfer.types,
      });
    } else if (event.dataTransfer.types.includes("action/select")) {
      dispatch(clearSelectNode());

      // hide drag preview image
      const prev = document.createElement("span");
      prev.style.display = "none";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setDragImage(prev, 10000, 10000);
      event.dataTransfer.setData(
        "action/select",
        JSON.stringify({
          initial: {
            x: event.clientX,
            y: event.clientY,
          },
        })
      );

      setDragData({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: {},
        types: event.dataTransfer.types,
      });
    }
  };

  const handleDrag = (event) => {
    requestAnimationFrame(() => {
      if (!dragLayerRef.current) return;
      dragLayerRef.current.style.transform = `scale(${scale}) translate(${
        direction == "direction/top" ||
        direction == "direction/top-right" ||
        direction == "direction/right" ||
        direction == "direction/bottom" ||
        direction == "direction/bottom-right" ||
        event.dataTransfer.types.includes("action/select")
          ? offset.x / scale
          : (event.clientX - initialPosition.x + offset.x) / scale
      }px, ${
        direction == "direction/left" ||
        direction == "direction/right" ||
        direction == "direction/bottom" ||
        direction == "direction/bottom-left" ||
        direction == "direction/bottom-right" ||
        event.dataTransfer.types.includes("action/select")
          ? offset.y / scale
          : (event.clientY - initialPosition.y + offset.y) / scale
      }px)`;
    });
  };

  const handleDragEnd = (event) => {
    if (types.includes("action/select")) {
      if (!boardRef.current) return;
      const boardBounds = boardRef.current.getBoundingClientRect();
      const startX =
        (Math.min(initialPosition.x, event.clientX) -
          boardBounds.left -
          offset.x) /
        scale;
      const startY =
        (Math.min(initialPosition.y, event.clientY) -
          boardBounds.top -
          offset.y) /
        scale;
      const endX =
        (Math.max(initialPosition.x, event.clientX) -
          boardBounds.left -
          offset.x) /
        scale;
      const endY =
        (Math.max(initialPosition.y, event.clientY) -
          boardBounds.top -
          offset.y) /
        scale;

      const nodesInBounds = {};
      boardChildren.forEach((child) => {
        const node = nodes[child.childId];
        if (!node) return;
        const bounds = {
          width: node.sX,
          height: node.sY,
          left: node.pX,
          top: node.pY,
          right: node.pX + node.sX,
          bottom: node.pY + node.sY,
        };
        if (node.type == BoardObjects.GROUP) {
          if (
            bounds.left > startX &&
            bounds.top > startY &&
            bounds.right < endX &&
            bounds.bottom < endY // crosses right wall
          ) {
            nodesInBounds[node.id] = node;
          }
        } else if (
          bounds.left < endX &&
          bounds.top < endY &&
          bounds.right > startX &&
          bounds.bottom > startY // crosses right wall
        ) {
          nodesInBounds[node.id] = node;
        }
      });
      dispatch(setSelectedNodes(nodesInBounds));
    }
    dispatch(clearDragDataAction());
  };
  //#endregion

  useEffect(() => {
    if (!window || !boardRef) return;
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("drag", handleDrag);
    window.addEventListener("dragend", handleDragEnd);
    boardRef.current.addEventListener("drop", clearDragData);

    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("drag", handleDrag);
      window.removeEventListener("dragend", handleDragEnd);
      boardRef.current.removeEventListener("drop", clearDragData);
    };
  }, [
    nodes,
    draggedNodes,
    selectedNodes,
    initialPosition,
    scale,
    offset,
    shiftKey,
    ctrlKey,
  ]);

  return (
    <div ref={dragLayerRef} className="clone-container">
      <ResizeMarquee
        scale={scale}
        offset={offset}
        getNodeSize={getNodeSize}
        preview
      />
      <SelectionMarquee
        boardId={boardId}
        boardRef={boardRef}
        scale={scale}
        offset={offset}
        active={types.includes("action/select")}
      />
      {Object.values(draggedNodes).map(({ id, type }) => {
        switch (type) {
          case BoardObjects.NOTE:
            return (
              <NotePreview
                key={id}
                id={id}
                resize={resize}
                getNodeSize={getNodeSize}
              />
            );
          case BoardObjects.TASK:
            return <TaskPreview key={id} id={id} />;
          case BoardObjects.GROUP:
            return (
              <GroupPreview
                key={id}
                id={id}
                resize={resize}
                getNodeSize={getNodeSize}
              />
            );
          case BoardObjects.BOARD:
            return <BoardIconPreview key={id} id={id} />;
          case BoardObjects.DOCUMENT:
            return <DocumentPreview key={id} id={id} />;
          case BoardObjects.IMAGE:
            return (
              <ImagePreview
                key={id}
                id={id}
                resize={resize}
                getNodeSize={getNodeSize}
              />
            );
          default:
            break;
        }
      })}
    </div>
  );
};

export default DragLayer;
