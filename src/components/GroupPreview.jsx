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
  let sizeX = sX;
  let sizeY = sY;
  const animateResize = (e) => {
    requestAnimationFrame(() => {
      if (!nodeRef.current) return;
      const { x, y } = getNodeSize(e.clientX, e.clientY, sX, sY);
      sizeX = x;
      sizeY = y;
      nodeRef.current.style.width = `${sizeX}px`;
      nodeRef.current.style.height = `${sizeY}px`;
    });
  };
  useEffect(() => {
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
      sX={sizeX}
      sY={sizeY}
      parentId={parent.id}
      parentType={parent.type}
    >
      <p
        className="editable"
        style={{
          pointerEvents: "none",
          borderRadius: "5px",
          fontWeight: "800",
        }}
      >
        {title}
      </p>
    </NodeWrapper>
  );
};

export default GroupPreview;
