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
import { useSelector } from "react-redux";

const Sidebar = ({ router }) => {
  const { id } = router.params;
  const [board, setBoard] = useState();
  const bruh = useSelector((state) => state.boards[!!id ? id : "root"]);
  useEffect(() => {
    setBoard(bruh);
  }, [id]);

  return (
    <div className="sidebar">
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
        name="Board"
        type={SidebarObjects.BOARD}
        icon={IconLayoutDashboard}
      />
      <SidebarObject name="Note" type={SidebarObjects.NOTE} icon={IconNote} />
      <SidebarObject
        name="Document"
        type={SidebarObjects.DOCUMENT}
        icon={IconFileText}
      />
      <SidebarObject
        name="Column"
        type={SidebarObjects.COLUMN}
        icon={IconStack2}
      />
      <SidebarObject
        name="To-do"
        type={SidebarObjects.TASK}
        icon={IconCheckbox}
      />
      <SidebarObject
        name="Image"
        type={SidebarObjects.IMAGE}
        icon={IconPhoto}
      />
    </div>
  );
};

const SidebarObject = ({ name, type, icon: Icon }) => {
  const ref = useRef(null);

  const handleDragStart = (event) => {
    // Should set this to plain text but the function reading this is expecting json
    event.stopPropagation();
    event.dataTransfer.setData("custom/sidebar", JSON.stringify({ type }));
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
