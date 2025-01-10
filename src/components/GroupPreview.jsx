/** @jsxImportSource @emotion/react */
import "../App.css";
import { useEffect, useRef } from "react";

import "../editor.scss";
import { useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";

const GroupPreview = ({ id, resize, getNodeSize }) => {
  const nodeRef = useRef();

  const { pX, pY, sX, sY, title, parent } = useSelector(
    (state) => state.groups[id] ?? state.drag.nodes[id]
  );
  const sizeRef = useRef({ x: sX, y: sY });
  const animateResize = (e) => {
    sizeRef.current = getNodeSize(e.clientX, e.clientY, sX, sY);
    requestAnimationFrame(() => {
      if (!nodeRef.current) return;
      nodeRef.current.style.width = `${sizeRef.current.x}px`;
      nodeRef.current.style.height = `${sizeRef.current.y}px`;
    });
  };
  useEffect(() => {
    console.log(resize);
    if (resize) {
      window.addEventListener("drag", animateResize);
    } else {
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
      type={"group"}
      canPosition={true}
      canResize={false}
      preview
      pX={pX}
      pY={pY}
      sX={sizeRef.current.x}
      sY={sizeRef.current.y}
      parent={parent}
      isInColumn={false}
    >
      <p class="editable" style={{ borderRadius: "5px", fontWeight: "800" }}>
        {title}
      </p>
    </NodeWrapper>
  );
};

export default GroupPreview;
