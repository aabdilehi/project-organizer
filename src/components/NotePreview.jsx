import "../App.css";
import { useEffect, useRef } from "react";

import "../editor.scss";
import { useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";

const NotePreview = ({ id, resize, getNodeSize }) => {
  const storedNode = useSelector((state) => state.notes[id]);
  const draggedNode = useSelector((state) => state.drag.nodes[id]);
  const { pX, pY, sX, sY, content, parent } = storedNode ?? draggedNode; // dragged node is used if the item does not exist yet, e.g. dragging from sidebar
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
    >
      <div
        className="ProseMirror"
        style={{
          // padding: "15px",
          // boxSizing: "border-box",
          margin: 0,
          height: "100%",
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
