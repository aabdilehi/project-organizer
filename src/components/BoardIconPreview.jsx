/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useMemo, useRef } from "react";
import { TbStar as StarIcon } from "react-icons/tb";
import { selectTypes } from "../utils/slices/selectors.ts";
const previewStyle = {
  fontWeight: "800",
  width: "100%",
  borderRadius: "5px",
  outline: "2px solid transparent",
  border: "none",
  wordWrap: "break-word",
  whiteSpace: "pre-wrap",
  overflow: "auto",
  overflowWrap: "anywhere",
  boxSizing: "border-box",
};
const BoardIconPreview = ({ id }) => {
  const storedNode = useSelector((state) => state.boards[id]);
  const draggedNode = useSelector((state) => state.drag.nodes[id]);
  const board = storedNode ?? draggedNode; // dragged node is used if the item does not exist yet, e.g. dragging from sidebar

  const nodeRef = useRef();

  return (
    <>
      <NodeWrapper
        ref={nodeRef}
        id={id}
        type={BoardObjects.BOARD}
        canPosition={true}
        canResize={false}
        pX={board.pX}
        pY={board.pY}
        preview
        parentId={board.parent.id}
        parentType={board.parent.type}
      >
        <div className={"icon-wrapper"}>
          <StarIcon pointerEvents={"none"} w={"100%"} h={"100%"} />
        </div>
        <p style={previewStyle}>{board.title}</p>
      </NodeWrapper>
    </>
  );
};

export default BoardIconPreview;
