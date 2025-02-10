import React, {
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { RootState } from "../../store";
import {
  addSelectNode,
  selectNode,
  toggleSelectNode,
} from "../../utils/slices/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import { updatePosition, updateSize } from "../../utils/slices/nodeActions";
import { BoardObjects } from "../../utils/enums/items";
import { debounce } from "lodash";
import { createSelector } from "@reduxjs/toolkit";

const selectMappedSelection = createSelector(
  [(state) => state.selection, (state) => state],
  (selection, state) =>
    Object.values(selection).map((node) => state[`${node.type}s`][node.id])
);

const selectMappedDragged = createSelector(
  [(state) => state.drag.nodes, (state) => state],
  (nodes, state) =>
    Object.values(nodes).map((node) => {
      return state[`${node.type}s`][node.id] ?? node;
    })
);

const selectDragging = createSelector(
  [(state) => state.drag.nodes],
  (nodes) => Object.keys(nodes).length > 0
);

export default forwardRef(
  (
    {
      preview = false,
      scale,
      offset,
      getNodeSize,
      ...props
    }: {
      preview?: boolean;
      scale?: any;
      offset?: any;
      getNodeSize?: any;
    },
    ref: any
  ) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => nodeRef.current!, []);
    const selectedNodes = useSelector(selectMappedSelection);
    const draggedNodes = useSelector(selectMappedDragged);
    const nodes = preview ? draggedNodes : selectedNodes;
    const dragging = useSelector(selectDragging);
    let startX, startY, endX, endY, sizeX, sizeY;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      startX = !startX || node.pX < startX ? node.pX : startX;
      endX = !endX || node.pX + node.sX > endX ? node.pX + node.sX : endX;
      startY = !startY || node.pY < startY ? node.pY : startY;
      endY = !endY || node.pY + node.sY > endY ? node.pY + node.sY : endY;
    }

    const padding = Math.min(20, (endX - startX) / 8);
    sizeX = endX - startX + padding;
    sizeY = endY - startY + padding;

    const animateResize = (e) => {
      requestAnimationFrame(() => {
        if (!nodeRef.current) return;
        const { x, y } = getNodeSize(e.clientX, e.clientY, sizeX, sizeY);
        nodeRef.current.style.width = `${x}px`;
        nodeRef.current.style.height = `${y}px`;
      });
    };
    useEffect(() => {
      if (preview) {
        window.addEventListener("drag", animateResize);
      }
      return () => {
        if (preview) {
          window.removeEventListener("drag", animateResize);
        }
      };
    }, [preview, nodes]);
    return nodes.length <= 0 ? null : (
      <div
        ref={nodeRef}
        className={`resize-wrapper${dragging && !preview ? " dragging" : ""}`}
        style={{
          width: `${sizeX}px`,
          height: `${sizeY}px`,
          transform: `translate(${startX - padding / 2}px, ${
            startY - padding / 2
          }px)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
        tabIndex={-1}
        {...props}
      >
        <div
          className="resize-handle top"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/top`, "");
          }}
        />
        <div
          className="resize-handle left"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/left`, "");
          }}
        />
        <div
          className="resize-handle bottom"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/bottom`, "");
          }}
        />
        <div
          className="resize-handle right"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/right`, "");
          }}
        />
        <div
          className="resize-handle top-left"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/top-left`, "");
          }}
        />
        <div
          className="resize-handle top-right"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/top-right`, "");
          }}
        />
        <div
          className="resize-handle bottom-left"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/bottom-left`, "");
          }}
        />
        <div
          className="resize-handle bottom-right"
          tabIndex={3}
          style={{ pointerEvents: preview ? "none" : "auto" }}
          draggable={!preview}
          onDragStart={(e) => {
            e.dataTransfer.setData("action/resize", "");
            e.dataTransfer.setData(`direction/bottom-right`, "");
          }}
        />
      </div>
    );
  }
);
