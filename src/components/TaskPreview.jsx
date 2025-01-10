/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useRef } from "react";
import { BadgePreview } from "./Modular/Badge.tsx";

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
  outline: "2px solid transparent",
  border: "none",
  wordWrap: "break-word",
  whiteSpace: "pre-wrap",
  overflow: "auto",
  overflowWrap: "anywhere",
  boxSizing: "border-box",
};

const TaskPreview = ({ id, isInColumn = false, columnWidth }) => {
  const nodeRef = useRef();
  const { pX, pY, title, status, deadline, badges, parent } = useSelector(
    (state) => state.tasks[id] ?? state.drag.nodes[id]
  );
  return (
    <>
      <NodeWrapper
        ref={nodeRef}
        id={id}
        type={BoardObjects.TASK}
        preview
        canPosition={true}
        canResize={false}
        pX={pX}
        pY={pY}
        parentId={parent.id}
        parentType={parent.type}
        isInColumn={isInColumn}
        columnWidth={columnWidth}
      >
        <input
          type="checkbox"
          style={{ gridArea: "checkbox", height: "20px", alignSelf: "center" }}
          checked={status}
          readOnly
        />
        <p
          style={{
            gridArea: "title",
            ...previewStyle,
            marginBottom: isInColumn ? "3px" : undefined,
          }}
        >
          {title}
        </p>
        <button type="button" disabled style={{ gridArea: "edit" }}>
          Edit
        </button>
        {Object.values(badges).length > 0 ? (
          <div
            style={{
              gridArea: "badges",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "2px",
              marginTop: "5px",
            }}
          >
            {Object.values(badges).map((badge) => (
              <BadgePreview id={badge.id} text={badge.text} />
            ))}
          </div>
        ) : undefined}
      </NodeWrapper>
    </>
  );
};

export default TaskPreview;
