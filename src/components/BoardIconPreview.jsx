/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useMemo, useRef } from "react";
import { TbStar as StarIcon } from "react-icons/tb";

const BoardIconPreview = ({
  id,
  pX,
  pY,
  title,
  parent,
  columnWidth,
  isInColumn = false,
}) => {
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
        pX={pX}
        pY={pY}
        preview
        parent={parent}
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
          {title}
        </p>
      </NodeWrapper>
    </>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const board = state.boards[id] ?? state.drag.nodes[id];
  return {
    pX: board.pX,
    pY: board.pY,
    title: board.title,
    parent: board.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardIconPreview);
