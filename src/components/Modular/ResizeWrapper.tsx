import React, { LegacyRef, useEffect } from "react";
import { useLayoutEffect, useRef } from "react";
import { BoardObjects } from "../../utils/enums/items";
import { connect } from "react-redux";
import { selectNode } from "../../utils/slices/selectionSlice";

const ResizeWrapper = ({
  canResize = false,
  id,
  type,
  parent,
  handleSelect,
  selected,
  onResize,
  ...props
}: {
  id: string;
  type: BoardObjects | string;
  parent: any;
  canResize?: boolean;
  handleSelect: any;
  selected: boolean;
  onResize: (e: React.DragEvent, direction: string) => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <>
      <div
        draggable={true}
        onDragStart={(e) => onResize(e, "left")}
        data-resize-type={"horizontal"}
        data-resize-origin={"left"}
        className="resize-handle left"
        tabIndex={99}
      />

      <div
        draggable={true}
        onDragStart={(e) => {
          onResize(e, "top");
        }}
        onDrag={(e) => {
          console.log("Hello???");
        }}
        data-resize-type={"vertical"}
        data-resize-origin={"top"}
        className="resize-handle top"
        tabIndex={99}
      />
    </>
  );
};
export default ResizeWrapper;
