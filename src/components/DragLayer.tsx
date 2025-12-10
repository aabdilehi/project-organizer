import React, { RefObject, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BoardObjects,
  DragAction,
  DragOrigin,
  DragRenderLayers,
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
  selectDraggedNodes,
  selectInitialPosition,
  selectTypes,
} from "../utils/slices/selectors";
import ResizeMarquee from "./Modular/ResizeMarquee";
import ImagePreview from "./ImagePreview";
import {
  GroupType,
  isRoot,
  NodeType,
  RootBoardType,
} from "../utils/classes/new-classes";
import {
  DefinedBoardObjects,
  DragState,
  PlainRootState,
  SliceNodeMap,
} from "../utils/slices/types";
import { ThunkAction } from "@reduxjs/toolkit";

export const PreviewRenderLayer = ({
  boardId,
  boardRef,
  transformRef,
  scale,
  offset,
  layer,
}: {
  boardId: string;
  boardRef: RefObject<HTMLDivElement>;
  transformRef: RefObject<HTMLDivElement>;
  scale: number;
  offset: { x: number; y: number };
  layer: DragRenderLayers;
}) => {
  const dragLayerRef = useRef<HTMLDivElement>(null);
  //#region Select drag data

  const initialPosition = useSelector(selectInitialPosition);

  const draggedNodes = useSelector((state: PlainRootState) =>
    selectDraggedNodes(state, layer)
  );

  const types = useSelector(selectTypes);
  const resize = types.includes(DragAction.RESIZE);
  const direction = types.find((value: any) =>
    Object.values(ResizeDirection).includes(value)
  );

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

  const handleDragStart = (event: any) => {
      if (!dragLayerRef.current || !transformRef.current) return;
      dragLayerRef.current.style.transform =
        transformRef.current.style.transform;
  };

  const handleDrag = (event: any) => {
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
  };

  useEffect(() => {
    window.addEventListener("dragstart", handleDragStart, true);
    window.addEventListener("drag", handleDrag, true);

    return () => {
      window.removeEventListener("dragstart", handleDragStart, true);
      window.removeEventListener("drag", handleDrag, true);
    };
  }, [draggedNodes, offset, scale]);

  return (
    <div
      ref={dragLayerRef}
      className={`clone-container ${
        layer == DragRenderLayers.TOP ? "top" : "bottom"
      }`}
    >
      <ResizeMarquee
        active={layer == DragRenderLayers.BOTTOM}
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
        active={
          layer == DragRenderLayers.BOTTOM && types.includes(DragAction.SELECT)
        }
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

function handleMoveActionThunk(
  boardId: string,
  event: DragEvent
): ThunkAction<
  {
    [id: string]: {
      id: string;
      type: DefinedBoardObjects;
      parent: { id: string; type: DefinedBoardObjects };
      offset?: { x: number; y: number };
    };
  },
  PlainRootState,
  unknown,
  any
> {
  return (dispatch, getState) => {
    const state = getState();
    const selection: {
      [id: string]: {
        id: string;
        type: DefinedBoardObjects;
        parent: { id: string; type: DefinedBoardObjects };
        offset?: { x: number; y: number };
      };
    } = { ...state.selection };
    let nodes: { [id: string]: NodeType | RootBoardType } = {};
    Object.keys(SliceNodeMap).forEach((slice) => {
      let bruh =
        state[
          slice as keyof Pick<
            PlainRootState,
            "boards" | "notes" | "tasks" | "documents" | "groups" | "images"
          >
        ];
      nodes = { ...nodes, ...bruh };
    });
    Object.values(selection).forEach((item) => {
      if (!item) return;
      const node = nodes[item.id];

      if (isRoot(node)) return;

      if (item.type == BoardObjects.GROUP) {
        // Find all nodes that are within bounds of group
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
          selection[item2.id] = {
            id: item2.id,
            type: item2.type,
            parent: item2.parent,
          };
          selection[item2.id] = {
            id: item2.id,
            type: item2.type,
            parent: item2.parent,
            offset: { x: item2.pX, y: item2.pY },
          };
        });
      }
      const x = node.pX;
      const y = node.pY;
      selection[item.id] = {
        ...selection[item.id],
        offset: {
          x: x,
          y: y,
        },
      };
    });

    dispatch(
      setDragDataAction({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: selection,
        layers: {
          [DragRenderLayers.BOTTOM]: Object.keys(selection).filter(
            (id) => selection[id].type == BoardObjects.GROUP
          ),
          [DragRenderLayers.TOP]: Object.keys(selection).filter(
            (id) => selection[id].type != BoardObjects.GROUP
          ),
        },
        types: event.dataTransfer!.types as (
          | DragAction
          | ResizeDirection
          | DragOrigin
        )[],
      })
    );

    return selection;
  };
}

function handleResizeActionThunk(
  event: DragEvent
): ThunkAction<{ [id: string]: NodeType }, PlainRootState, unknown, any> {
  return (dispatch, getState) => {
    const state = getState();
    const selection: {
      [id: string]: {
        id: string;
        type: DefinedBoardObjects;
        parent: { id: string; type: DefinedBoardObjects };
        offset?: { x: number; y: number };
      };
    } = { ...state.selection };
    let nodes: { [id: string]: NodeType | RootBoardType } = {};
    Object.keys(SliceNodeMap).forEach((slice) => {
      let bruh =
        state[
          slice as keyof Pick<
            PlainRootState,
            "boards" | "notes" | "tasks" | "documents" | "groups" | "images"
          >
        ];
      nodes = { ...nodes, ...bruh };
    });
    const selectedNodeData: { [id: string]: NodeType } = {};
    Object.values(selection).forEach((item) => {
      const node = nodes[item.id];
      if (isRoot(node)) return;
      selectedNodeData[item.id] = node;
    });

    const bottomLayer: DragState["layers"][0] = [];
    const topLayer: DragState["layers"][1] = [];

    Object.values(selectedNodeData).forEach(({ id, type }) => {
      if (type == BoardObjects.GROUP) bottomLayer.push(id as any);
      else topLayer.push(id as any);
    });

    dispatch(
      setDragDataAction({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: selectedNodeData,
        layers: {
          [DragRenderLayers.BOTTOM]: bottomLayer,
          [DragRenderLayers.TOP]: topLayer,
        },
        types: event.dataTransfer!.types as (
          | DragAction
          | ResizeDirection
          | DragOrigin
        )[],
      })
    );

    return selectedNodeData;
  };
}

function selectNodesInBound(
  boardId: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): ThunkAction<void, PlainRootState, unknown, any> {
  return (dispatch, getState) => {
    const state = getState();
    let nodes: { [id: string]: NodeType | RootBoardType } = {};
    Object.keys(SliceNodeMap).forEach((slice) => {
      let bruh =
        state[
          slice as keyof Pick<
            PlainRootState,
            "boards" | "notes" | "tasks" | "documents" | "groups" | "images"
          >
        ];
      nodes = { ...nodes, ...bruh };
    });
    const nodesInBounds: { [id: string]: NodeType } = {};
    const boardChildren = state.boards[boardId].childRefs;
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
  };
}

export const useDragLogic = ({
  boardId,
  boardRef,
  transformRef,
  scale,
  offset,
}: {
  boardId: string;
  boardRef: RefObject<HTMLDivElement>;
  transformRef: RefObject<HTMLDivElement>;
  scale: number;
  offset: { x: number; y: number };
}) => {
  //#region Dispatch props
  const dispatch = useDispatch<any>();

  const initialPosition = useSelector(selectInitialPosition);
  const types: string[] = useSelector(selectTypes);

  const clearDragData = (event: any) => {
    if (event.dataTransfer.types.includes(DragAction.SELECT)) return;
    dispatch(clearDragDataAction());
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

  const handleMoveAction = (event: DragEvent) => {
    if (!event.dataTransfer) return;

    // Obviously, I could just get the selectedNodeData inside the thunk
    const selectionData = dispatch(handleMoveActionThunk(boardId, event));

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
        selectedNodes: selectionData,
      })
    );
  };
  const handleResizeAction = (event: DragEvent) => {
    if (!event.dataTransfer) return;

    const prev = document.createElement("span");
    prev.style.display = "none";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setDragImage(prev, 10000, 10000);

    const direction = event.dataTransfer.types.find((type: string) =>
      Object.values(ResizeDirection).includes(type as ResizeDirection)
    );

    const selectedNodeData = dispatch(handleResizeActionThunk(event));

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
  };
  const handleSelectAction = (event: DragEvent) => {
    if (!event.dataTransfer) return;
    dispatch(clearSelectNode());
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

    dispatch(
      setDragDataAction({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: {},
        layers: {
          [DragRenderLayers.BOTTOM]: [],
          [DragRenderLayers.TOP]: [],
        },
        types: event.dataTransfer.types as (
          | DragAction
          | ResizeDirection
          | DragOrigin
        )[],
      })
    );
  };

  const handleDragStart = (event: DragEvent) => {
    if (!event.dataTransfer) return;
    if (!event.dataTransfer.types.includes(DragSignature)) return;
    if (event.dataTransfer.types.includes("text/plain")) return;
    if (event.dataTransfer.types.includes(DragOrigin.TOOLBAR)) return;
    event.stopPropagation();

    if (!boardRef.current || !transformRef.current) {
      return;
    }
    if (event.dataTransfer.types.includes(DragAction.MOVE))
      handleMoveAction(event);
    else if (event.dataTransfer.types.includes(DragAction.RESIZE))
      handleResizeAction(event);
    else if (event.dataTransfer.types.includes(DragAction.SELECT))
      handleSelectAction(event);

    transformRef.current.style.transform = `scale(${scale}) translate(${
      offset.x / scale
    }px, ${offset.y / scale}px)`;
  };
  const handleDragEnd = (event: DragEvent) => {
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
      dispatch(selectNodesInBound(boardId, startX, startY, endX, endY));
    }
    dispatch(clearDragDataAction());
  };
  //#endregion

  useEffect(() => {
    if (!window || !boardRef.current) return;
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("dragend", handleDragEnd);
    boardRef.current.addEventListener("drop", clearDragData);

    return () => {
      if (!window || !boardRef.current) return;
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("dragend", handleDragEnd);
      boardRef.current.removeEventListener("drop", clearDragData);
    };
  }, [initialPosition, types, scale, offset]);
};
