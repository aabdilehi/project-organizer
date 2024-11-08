/** @jsxImportSource @emotion/react */
import { useRef } from "react";
import { BoardObjects } from "../utils/enums/items";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

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

const ColumnPreview = ({ id, pX, pY, sX, title, childRefs, parent }) => {
  const nodeRef = useRef();
  const columnRef = useRef();

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
      sX={sX}
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

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const column = state.columns[id] ?? state.drag.nodes[id];

  return {
    title: column.title,
    childRefs: column.childRefs,
    pX: column.pX,
    pY: column.pY,
    sX: column.sX,
    parent: column.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ColumnPreview);
