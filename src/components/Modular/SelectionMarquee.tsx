import React, { useEffect, useLayoutEffect } from "react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedNodes } from "../../utils/slices/selectionSlice";
import { DragAction } from "../../utils/enums/items";

const SelectionMarquee = ({
  boardId,
  boardRef,
  scale,
  offset,
  active,
}: {
  boardId: string;
  boardRef: React.RefObject<HTMLDivElement>;
  scale: number;
  offset: { x: number; y: number };
  active: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null);

  let initX: number, initY: number;
  let nodeElements: NodeListOf<Element>; // node elements shouldnt change during this time anyway
  let nodeElementBounds: { [id: string]: DOMRect } = {}; // do not want to recalculate bounds every frame
  let boardBounds: DOMRect;
  const init = (e: DragEvent) => {
    if (e.dataTransfer!.types.includes("text/plain")) return;
    if (!e.dataTransfer!.types.includes(DragAction.SELECT)) return;
    if (!boardRef.current) return;
    boardBounds = boardRef.current.getBoundingClientRect();
    initX = e.clientX;
    initY = e.clientY;

    // Get all DOM elements that correspond to a node
    nodeElements = document.querySelectorAll(".node");

    // Clear the selected class from them
    nodeElements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      nodeElementBounds[element.id] = bounds;
      element.classList.remove("selected");
    });
  };
  const animate = (e: DragEvent) => {
    if (e.dataTransfer!.types.includes("text/plain")) return;
    if (!e.dataTransfer!.types.includes(DragAction.SELECT)) return;
    if (!boardBounds && boardRef.current) {
      boardBounds = boardRef.current.getBoundingClientRect();
    }
      if (!!ref.current) {
        const sX = (e.clientX - initX) / scale;
        const sY = (e.clientY - initY) / scale;
        const actualSX = Math.abs(sX); // size should not be negative
        const actualSY = Math.abs(sY);

        // Determine if top corner should be initial or current x and y position based on which is smaller
        const actualPX =
          (Math.min(initX, e.clientX) - boardBounds.left - offset.x) / scale;
        const actualPY =
          (Math.min(initY, e.clientY) - boardBounds.top - offset.y) / scale;

        // Set position and size of selection marquee
        ref.current.style.transform = `translate(${actualPX}px, ${actualPY}px)`;
        ref.current.style.width = `${actualSX}px`;
        ref.current.style.height = `${actualSY}px`;

        const startX = Math.min(initX, e.clientX);
        const endX = Math.max(initX, e.clientX);
        const startY = Math.min(initY, e.clientY);
        const endY = Math.max(initY, e.clientY);
        // Add/remove selected class to nodes within bounds of selection
        nodeElements.forEach((element) => {
          const bounds = nodeElementBounds[element.id];
          const padding = 0; //Math.min(bounds.width / 6, bounds.height / 6);
          if (element.classList.contains("group")) {
            if (
              bounds.left > startX &&
              bounds.top > startY &&
              bounds.right < endX &&
              bounds.bottom < endY
            ) {
              element.classList.add("selected");
              return;
            }
            element.classList.remove("selected");
            return;
          } else if (
            // ensure it is in bounds first
            bounds.left < endX &&
            bounds.top < endY &&
            bounds.right > startX &&
            bounds.bottom > startY &&
            ((bounds.top + padding > startY && bounds.top + padding < endY) || // crosses top wall
              (bounds.bottom - padding > startY &&
                bounds.bottom - padding < endY) || // crosses bottom wall
              (bounds.left + padding > startX &&
                bounds.left + padding < endX) || // crosses left wall
              (bounds.right - padding > startX &&
                bounds.right - padding < endX)) // crosses right wall
          ) {
            element.classList.add("selected");
            return;
          }
          element.classList.remove("selected");
        });
      }
  };

  useEffect(() => {
    window.addEventListener("dragstart", init);
    window.addEventListener("drag", animate);
    return () => {
      window.removeEventListener("dragstart", init);
      window.removeEventListener("drag", animate);
    };
  }, [scale, offset]);

  return active ? <div className="selection-marquee" ref={ref} /> : null;
};
export default SelectionMarquee;
