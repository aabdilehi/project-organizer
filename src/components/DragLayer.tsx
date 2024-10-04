import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StoreState } from "../utils/enums/state-type";
import { BoardObjects } from "../utils/enums/items";
import NotePreview from "./NotePreview";
import ColumnPreview from "./ColumnPreview";
import { clearDraggedNodes, setDraggedNodes } from "../utils/slices/dragSlice";

export default ({
  boardRef,
  transformRef,
  scale,
  ...props
}: {
  boardRef: React.MutableRefObject<HTMLDivElement>;
  transformRef: React.MutableRefObject<HTMLDivElement>;
  scale: number;
}) => {
  const dispatch = useDispatch();
  const selectedNodes = useSelector((state: StoreState) => state.selection);
  const allNodes = useSelector((state: StoreState) => state);
  const draggedNodes = useSelector((state: StoreState) => state.drag);
  const dragLayerRef = useRef<HTMLDivElement>();
  const initialPosition = useRef({ x: 0, y: 0 });
  const nodePosition = useCallback(
    (id: string, type: string) => {
      const node = allNodes[`${type}s`][id];
      if (!node) {
        return { x: 0, y: 0 };
      }
      return { x: node.pX, y: node.pY };
    },
    [allNodes]
  );

  console.log(scale);

  useEffect(() => {
    const handleDragStart = (event) => {
      event.stopPropagation();

      if (!boardRef.current || !dragLayerRef.current) {
        return;
      }

      // Initial click pos
      initialPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      dispatch(setDraggedNodes(selectedNodes));
      const selectedNodeOffsets = {};
      // create drag container
      Object.values(selectedNodes).map((item) => {
        if (!item) return;
        const { x, y } = nodePosition(item.id, item.type);
        selectedNodeOffsets[item.id] = {
          ...selectedNodes[item.id],
          offset: {
            x:
              x -
              -event.clientX -
              transformRef.current.getBoundingClientRect().left,
            y:
              y -
              event.clientY -
              transformRef.current.getBoundingClientRect().top,
          },
        };
      });

      // remove or hide drag preview image
      const prev = document.createElement("span");
      prev.style.display = "none";
      // set data
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setDragImage(prev, 0, 0);
      event.dataTransfer.setData(
        "custom/board",
        JSON.stringify({
          initial: initialPosition.current,
          selectedNodes: selectedNodeOffsets,
        })
      );
    };

    const handleDrag = (event) => {
      if (!dragLayerRef.current) return;
      requestAnimationFrame(() => {
        if (!dragLayerRef.current) return;
        dragLayerRef.current.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${
          event.clientX - initialPosition.current.x
        }, ${event.clientY - initialPosition.current.y})`;
      });
    };

    const clearPortal = () => {
      console.log("Wow");
      dispatch(clearDraggedNodes());
      console.log(draggedNodes);
    };

    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("drag", handleDrag);
    window.addEventListener("dragend", clearPortal);
    boardRef.current.addEventListener("drop", clearPortal);

    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("drag", handleDrag);
      window.removeEventListener("dragend", clearPortal);
      boardRef.current.removeEventListener("drop", clearPortal);
    };
  }, [selectedNodes]);

  return (
    <div ref={dragLayerRef} className="clone-container">
      {Object.values(draggedNodes).map(({ id, type }) => {
        switch (type) {
          case BoardObjects.NOTE:
            return <NotePreview key={id} id={id} />;
          case BoardObjects.COLUMN:
            return <ColumnPreview key={id} id={id} />;
          case BoardObjects.TASK:
          case BoardObjects.BOARD:
          case BoardObjects.DOCUMENT:
          default:
            break;
        }
      })}
    </div>
  );
};
