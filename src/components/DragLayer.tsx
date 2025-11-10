import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BoardObjects,
  DragAction,
  DragSignature,
  ResizeDirection,
} from "../utils/enums/items";
import NotePreview from "./NotePreview";
import {
  clearDragData as clearDragDataAction,
  setDragData as setDragDataAction,
} from "../utils/slices/dragSlice";
import TaskPreview from "./TaskPreview";
import BoardIconPreview from "./BoardIconPreview";
import DocumentPreview from "./DocumentPreview";
import GroupPreview from "./GroupPreview";
import SelectionMarquee from "./Modular/SelectionMarquee";
import {
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
import { GroupType, isRoot, NodeType } from "../utils/classes/new-classes";
import { DefinedBoardObjects, PlainRootState } from "../utils/slices/types";

const DragLayer = ({
  boardId,
  boardRef,
  transformRef,
  scale,
  offset,
  ...props
}: {
  boardId: string;
  boardRef: React.RefObject<HTMLDivElement>;
  transformRef: React.RefObject<HTMLDivElement>;
  offset: any;
  scale: any;
}) => {
  const dragLayerRef = useRef<HTMLDivElement>(null);
  //#region State props
  const nodes = useSelector(selectNodes);
  const selectedNodes = useSelector(selectSelection);

  const boardChildren = useSelector((state: PlainRootState) =>
    selectBoardChildren(state, boardId)
  );

  //#region Select drag data
  const draggedNodes = useSelector(selectDraggedNodes);
  const initialPosition = useSelector(selectInitialPosition);
  const types: string[] = useSelector(selectTypes);
  const resize = types.includes(DragAction.RESIZE);
  const direction = types.find((value: any) =>
    Object.values(ResizeDirection).includes(value)
  );
  console.log(types);
  //#endregion
  //#endregion

  //#region Dispatch props
  const dispatch = useDispatch();

  const clearDragData = (event: any) => {
    if (event.dataTransfer.types.includes(DragAction.SELECT)) return;
    dispatch(clearDragDataAction());
  };

  const setDragData = (data: any) => dispatch(setDragDataAction(data));
  const getNodeSize = (x: number, y: number, sX: number, sY: number) => {
    let newSX, newSY;
    switch (direction) {
      case ResizeDirection.LEFT:
        newSX = sX - (x - initialPosition.x) / scale;
        newSY = sY;
        break;
      case ResizeDirection.RIGHT:
        newSX = sX + (x - initialPosition.x) / scale;
        newSY = sY;
        break;
      case ResizeDirection.TOP:
        newSX = sX;
        newSY = sY - (y - initialPosition.y) / scale;
        break;

      case ResizeDirection.TOPLEFT:
        newSX = sX - (x - initialPosition.x) / scale;
        newSY = sY - (y - initialPosition.y) / scale;
        break;

      case ResizeDirection.TOPRIGHT:
        newSX = sX + (x - initialPosition.x) / scale;
        newSY = sY - (y - initialPosition.y) / scale;
        break;
      case ResizeDirection.BOTTOM:
        newSX = sX;
        newSY = sY + (y - initialPosition.y) / scale;
        break;
      case ResizeDirection.BOTTOMLEFT:
        newSX = sX - (x - initialPosition.x) / scale;
        newSY = sY + (y - initialPosition.y) / scale;
        break;
      case ResizeDirection.BOTTOMRIGHT:
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

  const setkbdModifiers = (e: KeyboardEvent) => {
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

  const handleDragStart = (event: any) => {
    if (!event.dataTransfer.types.includes(DragSignature)) return;
    event.stopPropagation();

    if (!boardRef.current || !transformRef.current) {
      return;
    }

    if (!dragLayerRef.current) return;
    let dragZIndex = "1";
    let boardZIndex = "2";

    if (event.dataTransfer.types.includes(DragAction.MOVE)) {
      dragZIndex = "2";
      boardZIndex = "1";
      const selectedNodeData = { ...selectedNodes };
      const selectedNodeOffsets: {
        [id: string]: {
          id: string;
          type: DefinedBoardObjects;
          parent: { id: string; type: DefinedBoardObjects };
          offset: { x: number; y: number };
        };
      } = {};
      Object.values(selectedNodeData).map((item) => {
        if (!item) return;

        const node = nodes[item.id];
        if (isRoot(node)) return;

        if (item.type == BoardObjects.GROUP) {
          const group = node as GroupType;
          const filteredNodes = Object.values(nodes).filter((item2) => {
            return (
              !isRoot(item2) &&
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
            if (isRoot(item2)) return;
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
        const x = node.pX;
        const y = node.pY;
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
        DragAction.MOVE,
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
    } else if (event.dataTransfer.types.includes(DragAction.RESIZE)) {
      // hide drag preview image

      const selectedNodeData: { [id: string]: NodeType } = {};
      Object.values(selectedNodes).forEach((item) => {
        const node = nodes[item.id];
        if (isRoot(node)) return;
        selectedNodeData[item.id] = node;
      });
      const prev = document.createElement("span");
      prev.style.display = "none";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setDragImage(prev, 10000, 10000);

      const direction = event.dataTransfer.types.find((type: string) =>
        Object.values(ResizeDirection).includes(type as ResizeDirection)
      );

      console.log(direction);
      event.dataTransfer.setData(
        DragAction.RESIZE,
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
    } else if (event.dataTransfer.types.includes(DragAction.SELECT)) {
      dispatch(clearSelectNode());
      dragZIndex = "2";
      boardZIndex = "1";

      // hide drag preview image
      const prev = document.createElement("span");
      prev.style.display = "none";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setDragImage(prev, 10000, 10000);
      event.dataTransfer.setData(
        DragAction.SELECT,
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

    requestAnimationFrame(() => {
      if (!dragLayerRef.current || !transformRef.current) return;
      dragLayerRef.current.style.transform =
        transformRef.current.style.transform = `scale(${scale}) translate(${
          offset.x / scale
        }px, ${offset.y / scale}px)`;
      dragLayerRef.current.style.zIndex = dragZIndex;
      transformRef.current.style.zIndex = boardZIndex;
    });
  };

  const handleDrag = (event: any) => {
    requestAnimationFrame(() => {
      if (!dragLayerRef.current) return;
      dragLayerRef.current.style.transform = `scale(${scale}) translate(${
        direction == ResizeDirection.TOP ||
        direction == ResizeDirection.TOPRIGHT ||
        direction == ResizeDirection.RIGHT ||
        direction == ResizeDirection.BOTTOM ||
        direction == ResizeDirection.BOTTOMRIGHT ||
        event.dataTransfer.types.includes(DragAction.SELECT)
          ? offset.x / scale
          : (event.clientX - initialPosition.x + offset.x) / scale
      }px, ${
        direction == ResizeDirection.LEFT ||
        direction == ResizeDirection.RIGHT ||
        direction == ResizeDirection.BOTTOM ||
        direction == ResizeDirection.BOTTOMLEFT ||
        direction == ResizeDirection.BOTTOMRIGHT ||
        event.dataTransfer.types.includes(DragAction.SELECT)
          ? offset.y / scale
          : (event.clientY - initialPosition.y + offset.y) / scale
      }px)`;
    });
  };

  const handleDragEnd = (event: DragEvent) => {
    requestAnimationFrame(() => {
      if (!dragLayerRef.current || !transformRef.current) return;
      dragLayerRef.current.style.zIndex = "1";
      transformRef.current.style.zIndex = "2";
    });
    if (types.includes(DragAction.SELECT)) {
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

      const nodesInBounds: { [id: string]: NodeType } = {};
      boardChildren.forEach((child) => {
        const node = nodes[child.id];
        if (!node || isRoot(node)) return;
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
    if (!window || !boardRef.current) return;
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("drag", handleDrag);
    window.addEventListener("dragend", handleDragEnd);
    boardRef.current.addEventListener("drop", clearDragData);

    return () => {
      if (!window || !boardRef.current) return;
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
        active={types.includes(DragAction.SELECT)}
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
            return <ImagePreview key={id} id={id} />;
          default:
            break;
        }
      })}
    </div>
  );
};

export default DragLayer;
