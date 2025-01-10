/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from "react";
import { BoardObjects } from "../utils/enums/items";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";

import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import NotePreview from "./NotePreview.jsx";
import TaskPreview from "./TaskPreview.jsx";
import BoardIconPreview from "./BoardIconPreview.jsx";
import DocumentPreview from "./DocumentPreview.jsx";

const previewStyle = {
  fontWeight: "800",
  borderRadius: "10px",
};

const ColumnPreview = ({ id, resize, getNodeSize }) => {
  const nodeRef = useRef();
  const columnRef = useRef();
  const { title, childRefs, pX, pY, sX, parent } = useSelector(
    (state) => state.columns[id] ?? state.drag.nodes[id]
  );

  const sizeRef = useRef({ x: sX });
  const animateResize = (e) => {
    sizeRef.current = getNodeSize(e.clientX, e.clientY, sX, 0);
    requestAnimationFrame(() => {
      if (!nodeRef.current) return;
      nodeRef.current.style.width = `${sizeRef.current.x}px`;
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
      canPosition={true}
      canResize={false}
      id={id}
      type={"column"}
      parent={parent}
      preview
      pX={pX}
      pY={pY}
      sX={sizeRef.current.x}
    >
      <CustomEditablePreview
        as={"h1"}
        canEdit={false}
        text={title}
        width={sX}
        textStyle={previewStyle}
      />
      <span
        ref={columnRef}
        style={{
          width: "100%",
          alignItems: "center",
          border: "2px dashed grey",
          borderRadius: "8px",
          minHeight: childRefs.length > 0 ? undefined : "80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {childRefs.map(({ childId, childType }) => {
          switch (childType) {
            case BoardObjects.NOTE:
              return (
                <NotePreview
                  key={childId}
                  id={childId}
                  columnWidth={sX}
                  isInColumn
                />
              );
            case BoardObjects.TASK:
              return (
                <TaskPreview
                  key={childId}
                  id={childId}
                  columnWidth={sX}
                  isInColumn
                />
              );
            case BoardObjects.BOARD:
              return (
                <BoardIconPreview
                  key={childId}
                  id={childId}
                  columnWidth={sX}
                  isInColumn
                />
              );
            case BoardObjects.DOCUMENT:
              return (
                <DocumentPreview
                  key={childId}
                  id={childId}
                  columnWidth={sX}
                  isInColumn
                />
              );
            default:
              break;
          }
        })}
      </span>
    </NodeWrapper>
  );
};

export default ColumnPreview;
