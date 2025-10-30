/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent } from "@tiptap/react";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useNavigate } from "react-router-dom";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { TbStar as StarIcon } from "react-icons/tb";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import { updateSize, updateTitle } from "../utils/slices/nodeActions.ts";
import { Modal } from "./Modular/Modal";
import _ from "lodash";
import { selectDraggedNodes } from "../utils/slices/selectors.ts";

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};
function isEmpty(obj) {
  for (var prop in obj) {
    if (Object.hasOwn(obj, prop)) return false;
  }
  return true;
}

const BoardIcon = ({ id, allowDrop, drop, offset, scale, onContextMenu }) => {
  const dispatch = useDispatch();

  const { pX, pY, sX, sY, title, parent } = useSelector(
    (state) => state.boards[id]
  );
  const selected = useSelector((state) => Object.hasOwn(state.selection, id));

  const draggedNodes = useSelector(selectDraggedNodes);
  const dragging = !isEmpty(draggedNodes) && !Object.hasOwn(draggedNodes, id);
  const navigate = useNavigate();
  const nodeRef = useRef();

  const [activeDropZone, setDropZoneActive] = useState(false);
  const updateSizeFromElement = () =>
    requestAnimationFrame(() => {
      if (nodeRef.current != null) {
        nodeRef.current.style.height = "fit-content";
      }
    });

  updateSizeFromElement();

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
    <NodeWrapper
      ref={nodeRef}
      id={id}
      type={BoardObjects.BOARD}
      canPosition={true}
      canResize={false}
      pX={pX}
      pY={pY}
      sX={65}
      sY={120}
      parentId={parent.id}
      parentType={parent.type}
      scale={scale}
      offset={offset}
      onContextMenu={onContextMenu}
    >
      <div
        className={`icon-wrapper${
          dragging ? (activeDropZone ? " dropzone over" : " dropzone") : ""
        }`}
        onDoubleClick={() => {
          navigate(`/${id}`);
        }}
        onDrop={(event) => {
          event.stopPropagation();
          if (!drop) return;
          drop(event, id);
        }}
        onDragOver={(event) => {
          if (!allowDrop) return;
          allowDrop(event);
        }}
      >
        <StarIcon pointerEvents={"none"} w={"100%"} h={"100%"} />
      </div>
      <CustomEditablePreview
        as={"p"}
        canEdit={selected}
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
        onImmediateChange={updateSizeFromElement}
      />
    </NodeWrapper>
  );
};

export default BoardIcon;
