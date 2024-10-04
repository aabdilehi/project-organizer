/** @jsxImportSource @emotion/react */
import "../App.css";
import { useRef } from "react";

import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { BoardObjects } from "../utils/enums/items.tsx";

const NotePreview = ({
  id,
  pX,
  pY,
  sX,
  sY,
  offsetX,
  offsetY,
  content,
  parent,
  isInColumn = false,
}) => {
  const nodeRef = useRef();

  return (
    <NodeWrapper
      ref={nodeRef}
      className="clone"
      id={id}
      type={"note"}
      canPosition={true}
      canResize={false}
      preview
      pX={pX + offsetX}
      pY={pY + offsetY}
      sX={sX}
      sY={sY}
      parent={parent}
      isInColumn={isInColumn}
    >
      <div
        className="ProseMirror"
        style={{
          padding: "15px",
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
  const note = state.notes[id];
  return {
    pX: note.pX,
    pY: note.pY,
    sX: note.sX,
    sY: note.sY,
    content: note.content,
    parent: note.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(NotePreview);
