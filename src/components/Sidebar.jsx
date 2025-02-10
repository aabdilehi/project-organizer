import { useEffect, useMemo, useRef, useState } from "react";
import { css } from "@emotion/react";

import { BoardObjects, SidebarObjects } from "../utils/enums/items";
import { Button } from "@chakra-ui/react";
import React from "react";
import {
  TbArrowBack as IconArrowBack,
  TbArrowLeft as IconArrowLeft,
  TbCheckbox as IconCheckbox,
  TbFileText as IconFileText,
  TbHome as IconHome,
  TbLayoutDashboard as IconLayoutDashboard,
  TbNote as IconNote,
  TbPhoto as IconPhoto,
  TbStack2 as IconStack2,
} from "react-icons/tb";
import { withRouter } from "./Modular/ComponentWithRouterProp";
import { connect, useDispatch, useSelector } from "react-redux";
import { clearDragData, setDragData } from "../utils/slices/dragSlice";
import { formatData, NodeTypeMap } from "../utils/classes/new-classes";
import { v4 as uuidv4 } from "uuid";

const Sidebar = ({ router }) => {
  const sideBarRef = useRef();

  const { id } = router.params;
  const boardId = !!id ? id : "root";
  const scale = useSelector((state) => state.boards[boardId].scale);
  const offset = useSelector((state) => state.boards[boardId].offset);
  const parent = useSelector((state) => state.boards[boardId].parent);

  const dispatch = useDispatch();

  const createNodeDragPreview = (event, type) => {
    if (!sideBarRef.current) return;
    const boundingRect = sideBarRef.current.getBoundingClientRect();
    dispatch(clearDragData());
    const node = formatData(
      {
        id: uuidv4(),
        pX: (event.clientX - boundingRect.right - offset.x) / scale,
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
        types: event.dataTransfer.types,
      })
    );
  };

  return (
    <div ref={sideBarRef} className="sidebar">
      <button
        type="button"
        className="sidebar-button"
        onClick={() => {
          router.navigate(`/`);
        }}
        disabled={!scale || boardId === "root"}
      >
        <IconHome size={25} />
      </button>
      <button
        type="button"
        className="sidebar-button"
        onClick={() => {
          router.navigate(
            parent.id === "root" || parent.type !== BoardObjects.BOARD
              ? `/`
              : `/${parent.id}`
          );
        }}
        disabled={!parent}
      >
        <IconArrowLeft size={25} />
      </button>

      <SidebarObject
        onDragStart={(event, type) => createNodeDragPreview(event, type)}
        name="Board"
        type={SidebarObjects.BOARD}
        icon={IconLayoutDashboard}
      />
      <SidebarObject
        onDragStart={(event, type) => createNodeDragPreview(event, type)}
        name="Note"
        type={SidebarObjects.NOTE}
        icon={IconNote}
      />
      <SidebarObject
        onDragStart={(event, type) => createNodeDragPreview(event, type)}
        name="Document"
        type={SidebarObjects.DOCUMENT}
        icon={IconFileText}
      />
      <SidebarObject
        onDragStart={(event, type) => createNodeDragPreview(event, type)}
        name="Column"
        type={SidebarObjects.COLUMN}
        icon={IconStack2}
      />
      <SidebarObject
        onDragStart={(event, type) => createNodeDragPreview(event, type)}
        name="To-do"
        type={SidebarObjects.TASK}
        icon={IconCheckbox}
      />
      <SidebarObject
        onDragStart={(event, type) => createNodeDragPreview(event, type)}
        name="Group"
        type={SidebarObjects.GROUP}
        icon={IconCheckbox}
      />
      <SidebarObject
        onDragStart={(event, type) => createNodeDragPreview(event, type)}
        name="Image"
        type={SidebarObjects.IMAGE}
        icon={IconPhoto}
      />
    </div>
  );
};

const SidebarObject = ({ name, type, icon: Icon, onDragStart }) => {
  const ref = useRef(null);

  const handleDragStart = (event) => {
    // remove or hide drag preview image
    const prev = document.createElement("span");
    prev.style.display = "none";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData("origin/sidebar", JSON.stringify({ type }));
    onDragStart(event, type);
  };

  return (
    <div
      className="sidebar-item"
      draggable
      onDragStart={handleDragStart}
      ref={ref}
    >
      <Icon size={25} />
      <p>{name}</p>
    </div>
  );
};

export default withRouter(Sidebar);
