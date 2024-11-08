/** @jsxImportSource @emotion/react */
import "../App.css";
import { useRef } from "react";

import "../editor.scss";
import { connect } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";

const NotePreview = ({
  id,
  pX,
  pY,
  sX,
  sY,
  content,
  parent,
  columnWidth,
  isInColumn = false,
}) => {
  const nodeRef = useRef();

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
      sX={sX}
      sY={sY}
      parent={parent}
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

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const note = state.notes[id] ?? state.drag.nodes[id];
  return {
    pX: note.pX,
    pY: note.pY,
    sX: note.sX,
    sY: note.sY,
    content: note.content,
    parent: note.parent,
  };
};

export default connect(mapStateToProps, null)(NotePreview);
