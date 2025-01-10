/** @jsxImportSource @emotion/react */
import "../App.css";
import { useEffect, useLayoutEffect, useRef } from "react";

import "../editor.scss";
import { connect, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { BoardObjects } from "../utils/enums/items.tsx";

const NotePreview = ({
  id,
  resize,
  columnWidth,
  getNodeSize,
  isInColumn = false,
}) => {
  const { pX, pY, sX, sY, content, parent } = useSelector(
    (state) => state.notes[id] ?? state.drag.nodes[id]
  );
  const nodeRef = useRef(null);
  const sizeRef = useRef({ x: sX, y: sY });
  const animateResize = (e) => {
    requestAnimationFrame(() => {
      if (!nodeRef.current) return;
      sizeRef.current = getNodeSize(e.clientX, e.clientY, sX, sY);
      nodeRef.current.style.width = `${sizeRef.current.x}px`;
      nodeRef.current.style.height = `${sizeRef.current.y}px`;
    });
  };
  useEffect(() => {
    if (resize) {
      window.addEventListener("drag", animateResize);
    }
    return () => {
      window.removeEventListener("drag", animateResize);
    };
  }, [resize]);
  return (
    <NodeWrapper
      ref={nodeRef}
      id={id}
      type={"note"}
      canPosition={true}
      canResize={false}
      preview
      pX={pX}
      pY={pY}
      sX={sizeRef.current.x}
      sY={sizeRef.current.y}
      parentId={parent.id}
      parentType={parent.type}
      isInColumn={isInColumn}
      columnWidth={columnWidth}
    >
      <div
        className="ProseMirror"
        style={{
          padding: "15px",
          boxSizing: "border-box",
          margin: 0,
          height: "fit-content",
          minHeight: sY + "px",
          overflow: "none",
          border: "none",
          fontWeight: "800",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </NodeWrapper>
  );
};

export default NotePreview;
