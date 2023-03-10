/** @jsxImportSource @emotion/react */
import { useState, useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { useDrag } from "react-dnd";

import { SidebarObjects } from "../enums/items";

const Sidebar = () => {
  return (
    <div id="sidebar">
      <SidebarObject name="Note" type={SidebarObjects.NOTE} />
      <SidebarObject name="Column" type={SidebarObjects.COLUMN} />
    </div>
  );
};

const SidebarObject = ({ name, type }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: { type: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(ref);

  return (
    <>
      <label
        ref={ref}
        css={css`
          text-align: center;
          margin: 5px auto;
          width: 50px;
        `}
      >
        <div
          css={css`
            background-color: red;
            height: 50px;
            color: green;
            cursor: ${"pointer"};
          `}
        ></div>
        {name}
      </label>
    </>
  );
};

export default Sidebar;
