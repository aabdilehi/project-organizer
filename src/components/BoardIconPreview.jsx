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

const BoardIconPreview = ({ id, columnWidth, isInColumn = false }) => {
  const types = useSelector(selectTypes);
  let board;
  if (types.includes("origin/sidebar")) {
    board = useSelector((state) => state.dragged[id]);
  } else {
    board = useSelector((state) => state.boards[id]);
  }

  const previewStyle = useMemo(
    () => ({
      fontWeight: "800",
      width: "100%",
      margin: isInColumn ? undefined : "auto",
      marginBottom: isInColumn ? undefined : "3px",
      borderRadius: "5px",
      outline: "2px solid transparent",
      border: "none",
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      overflow: "auto",
      overflowWrap: "anywhere",
      boxSizing: "border-box",
    }),
    [isInColumn]
  );
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
        isInColumn={isInColumn}
        columnWidth={columnWidth}
      >
        <div className={"icon-wrapper"}>
          <StarIcon pointerEvents={"none"} w={"100%"} h={"100%"} />
        </div>
        <p
          style={{
            ...previewStyle,
            margin: isInColumn ? undefined : "auto",
            marginBottom: isInColumn ? undefined : "3px",
          }}
        >
          {board.title}
        </p>
      </NodeWrapper>
    </>
  );
};

export default BoardIconPreview;
