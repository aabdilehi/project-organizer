/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent } from "@tiptap/react";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useNavigate } from "react-router-dom";
import React, { useLayoutEffect, useRef, useState } from "react";
import { StarIcon } from "@chakra-ui/icons";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import { updateTitle } from "../utils/slices/nodeActions.ts";
import { Modal } from "./Modular/Modal";

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};

const BoardIcon = ({ id, pX, pY, title, parent, allowDrop, drop }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nodeRef = useRef();
  const selected = useSelector((state) => !!state.selection[id]);

  // Determines sizing and positioning based on whether in column or not
  let isInColumn = parent.type === BoardObjects.COLUMN;

  const [activeDropZone, setDropZoneActive] = useState(false);

  // Really annoying as this event sucks at bubbling properly so i have to do this

  const onDragOver = (event) => {
    if (
      event.target == nodeRef.current ||
      nodeRef.current.contains(event.target)
    ) {
      setDropZoneActive(true);
    } else {
      setDropZoneActive(false);
    }
  };

  useLayoutEffect(() => {
    if (nodeRef.current) {
      window.addEventListener("dragenter", onDragOver);
    }
    return () => {
      if (nodeRef.current) {
        window.removeEventListener("dragenter", onDragOver);
      }
    };
  }, []);

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
        parent={parent}
        isInColumn={isInColumn}
      >
        <div
          className={activeDropZone ? "icon-wrapper dropzone" : "icon-wrapper"}
          onDoubleClick={() => {
            navigate(`/${id}`);
          }}
          onDrop={(event) => {
            event.stopPropagation();
            drop(event, id);
          }}
          onDragOver={(event) => {
            allowDrop(event);
          }}
        >
          <StarIcon pointerEvents={"none"} w={"100%"} h={"100%"} />
        </div>
        <CustomEditablePreview
          as={"p"}
          canEdit={true}
          text={title}
          textStyle={previewStyle}
          onChange={(value) =>
            dispatch(
              updateTitle.action({
                id,
                type: BoardObjects.BOARD,
                title: value,
              })
            )
          }
        />
      </NodeWrapper>
    </>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const board = state.boards[id];
  return {
    pX: board.pX,
    pY: board.pY,
    title: board.title,
    parent: board.parent,
    childRefs: board.childRefs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardIcon);
