import { useEffect, useRef, useState } from "react";
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
import { connect, useSelector } from "react-redux";
import { clearDragData, setDragData } from "../utils/slices/dragSlice";
import { TypeClassMap } from "../utils/classes/new-classes";
import { v4 as uuidv4 } from "uuid";

const Sidebar = ({ board, setDragData, router }) => {
  const sideBarRef = useRef();
  return (
    <div ref={sideBarRef} className="sidebar">
      <button
        type="button"
        className="sidebar-button"
        onClick={() => {
          router.navigate(`/`);
        }}
        disabled={!board || board.id === "root"}
      >
        <IconHome size={25} />
      </button>
      <button
        type="button"
        className="sidebar-button"
        onClick={() => {
          router.navigate(
            board.parent.id === "root" ||
              board.parent.type !== BoardObjects.BOARD
              ? `/`
              : `/${board.parent.id}`
          );
        }}
        disabled={!board || !board.parent}
      >
        <IconArrowLeft size={25} />
      </button>

      <SidebarObject
        onDragStart={(event, type) => setDragData(event, type, sideBarRef)}
        name="Board"
        type={SidebarObjects.BOARD}
        icon={IconLayoutDashboard}
      />
      <SidebarObject
        onDragStart={(event, type) => setDragData(event, type, sideBarRef)}
        name="Note"
        type={SidebarObjects.NOTE}
        icon={IconNote}
      />
      <SidebarObject
        onDragStart={(event, type) => setDragData(event, type, sideBarRef)}
        name="Document"
        type={SidebarObjects.DOCUMENT}
        icon={IconFileText}
      />
      <SidebarObject
        onDragStart={(event, type) => setDragData(event, type, sideBarRef)}
        name="Column"
        type={SidebarObjects.COLUMN}
        icon={IconStack2}
      />
      <SidebarObject
        onDragStart={(event, type) => setDragData(event, type, sideBarRef)}
        name="To-do"
        type={SidebarObjects.TASK}
        icon={IconCheckbox}
      />
      <SidebarObject
        onDragStart={(event, type) => setDragData(event, type, sideBarRef)}
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
    event.dataTransfer.setData("custom/sidebar", JSON.stringify({ type }));
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

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.router.params;
  const board = state.boards[!!id ? id : "root"];
  return {
    board,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setDragData: (data) => dispatch(setDragData(data)),
    clearDragData: () => dispatch(clearDragData()),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    clearDragData: dispatchProps.clearDragData,
    setDragData: (event, type, sideBarRef) => {
      if (!sideBarRef.current) return;
      const boundingRect = sideBarRef.current.getBoundingClientRect();
      dispatchProps.clearDragData();
      console.log(stateProps.board);
      const node = new TypeClassMap[type]({
        id: uuidv4(),
        pX:
          (event.clientX - boundingRect.right - stateProps.board.offset.x) /
          stateProps.board.scale,
        pY:
          (event.clientY - boundingRect.top - stateProps.board.offset.y) /
          stateProps.board.scale,
        parent: {
          id: stateProps.board.id,
          type: BoardObjects.BOARD,
        },
      }).serialize();
      dispatchProps.setDragData({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: { [node.id]: node },
      });
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(Sidebar)
);
