/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useMemo, useRef } from "react";
import { TbFileText } from "react-icons/tb";

const DocumentPreview = ({
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
    <NodeWrapper
      ref={nodeRef}
      id={id}
      type={BoardObjects.DOCUMENT}
      canPosition={true}
      canResize={false}
      pX={pX}
      pY={pY}
      parent={parent}
      preview
      isInColumn={isInColumn}
      columnWidth={columnWidth}
    >
      <div className="icon-wrapper">
        <TbFileText pointerEvents={"none"} />
      </div>
      <p style={previewStyle}>{title}</p>
    </NodeWrapper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const document = state.documents[id] ?? state.drag.nodes[id];
  return {
    pX: document.pX,
    pY: document.pY,
    title: document.title,
    parent: document.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentPreview);
