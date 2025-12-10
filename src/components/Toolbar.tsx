import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  BoardObjects,
  DragAction,
  DragOrigin,
  DragRenderLayers,
  DragSignature,
  ResizeDirection,
} from "../utils/enums/items";
import React from "react";
import {
  TbArrowLeft as IconArrowLeft,
  TbCheckbox as IconCheckbox,
  TbFileText as IconFileText,
  TbHome as IconHome,
  TbLayoutDashboard as IconLayoutDashboard,
  TbNote as IconNote,
  TbPhoto as IconPhoto,
  TbStack2 as IconStack2,
  TbDownload as IconExport,
  TbUpload as IconImport,
} from "react-icons/tb";
import { withRouter } from "./Modular/ComponentWithRouterProp";
import { useDispatch, useSelector } from "react-redux";
import { clearDragData, setDragData } from "../utils/slices/dragSlice";
import { formatData, NodeTypeMap } from "../utils/classes/new-classes";
import { ExportButton, ImportButton } from "./Modular/ExportButton";
import { Tooltip, TooltipWrapper } from "./Modular/IconTooltip";
import { nanoid } from "@reduxjs/toolkit";
import { DefinedBoardObjects } from "../utils/slices/types";
import { IconType } from "react-icons";

const Toolbar = ({
  router,
  boardId,
  boardRef,
  scale,
  offset,
  parent,
}: {
  router: any;
  boardId: string;
  boardRef: React.RefObject<HTMLDivElement>;
  scale: number;
  offset: { x: number; y: number };
  parent: { id: string; type: BoardObjects };
}) => {
  const sideBarRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();

  const createNodeDragPreview = (
    event: React.DragEvent<HTMLDivElement>,
    type: DefinedBoardObjects
  ) => {
    if (!boardRef.current) return;
    const boundingRect = boardRef.current.getBoundingClientRect();
    dispatch(clearDragData());
    const node = formatData(
      {
        id: nanoid(),
        pX: (event.clientX - boundingRect.left - offset.x) / scale,
        pY: (event.clientY - boundingRect.top - offset.y) / scale,
        parent: {
          id: boardId,
          type: BoardObjects.BOARD,
        },
      },
      NodeTypeMap[type]
    );
    dispatch(
      setDragData({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: { [node.id]: node },
        layers: {
          [DragRenderLayers.BOTTOM]: [],
          [DragRenderLayers.TOP]: [node.id],
        },
        types: event.dataTransfer!.types as (
          | DragAction
          | DragOrigin
          | ResizeDirection
        )[],
      })
    );
  };

  return (
    <div
      ref={sideBarRef}
      className="toolbar"
      onWheel={(e) => {
        e.stopPropagation();
      }}
      // onDragStart={(e) => {e.stopPropagation(); e.preventDefault();}} 
    >
      <div>
        <TooltipWrapper name="Home" placement="right">
          <button
            type="button"
            className="toolbar-button"
            onClick={() => {
              router.navigate(`/`);
            }}
            disabled={!scale || boardId === "root"}
          >
            <IconHome size={20} />
          </button>
        </TooltipWrapper>
        <TooltipWrapper name="Import" placement="right">
          <ImportButton className="toolbar-button">
            <IconImport size={20} />
          </ImportButton>
        </TooltipWrapper>
        <TooltipWrapper name="Export" placement="right">
          <ExportButton className="toolbar-button">
            <IconExport size={20} />
          </ExportButton>
        </TooltipWrapper>

        <TooltipWrapper name="Back" placement="right">
          <button
            type="button"
            className="toolbar-button"
            onClick={() => {
              router.navigate(
                !Object.hasOwn(parent, "id") ||
                  (Object.hasOwn(parent, "type") &&
                    parent.type !== BoardObjects.BOARD)
                  ? `/`
                  : `/${parent.id}`
              );
            }}
            disabled={!parent}
          >
            <IconArrowLeft size={24} />
          </button>
        </TooltipWrapper>
      </div>
      <div>
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Board"
          type={BoardObjects.BOARD}
          icon={IconLayoutDashboard}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Note"
          type={BoardObjects.NOTE}
          icon={IconNote}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Document"
          type={BoardObjects.DOCUMENT}
          icon={IconFileText}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="To-do"
          type={BoardObjects.TASK}
          icon={IconCheckbox}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Group"
          type={BoardObjects.GROUP}
          icon={IconCheckbox}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Image"
          type={BoardObjects.IMAGE}
          icon={IconPhoto}
        />
      </div>
    </div>
  );
};

const ToolbarObject = ({
  name,
  type,
  icon: Icon,
  onDragStart,
}: {
  name: string;
  type: DefinedBoardObjects;
  icon: IconType;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    type: DefinedBoardObjects
  ) => void;
}) => {
  const ref = useRef(null);
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer) return;
    // remove or hide drag preview image
    const prev = document.createElement("span");
    prev.style.display = "none";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData(DragSignature, "");
    event.dataTransfer.setData(DragOrigin.TOOLBAR, JSON.stringify({ type }));
    event.dataTransfer.setData(DragAction.MOVE, "");
    onDragStart(event, type);
  };

  return (
    <TooltipWrapper name={name} placement="right">
      <div
        className="toolbar-item"
        draggable
        onDragStart={handleDragStart}
        ref={ref}
      >
        <Icon size={20} />
      </div>
    </TooltipWrapper>
  );
};

export default withRouter(Toolbar);
