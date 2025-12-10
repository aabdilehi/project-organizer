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

const BoardIcon = ({ id, allowDrop, drop, onContextMenu, scale}) => {
  if (!id) return;
  const dispatch = useDispatch();

  const { pX, pY, sX, sY, title, parent } = useSelector(
    (state) => state.boards[id]
  );
  const draggedNodes = useSelector(selectDraggedNodes);
  const dragging = !isEmpty(draggedNodes) && !Object.hasOwn(draggedNodes, id);
  const navigate = useNavigate();
  const nodeRef = useRef();

  const [activeDropZone, setDropZoneActive] = useState(false);
  const selected = useSelector((state) => Object.hasOwn(state.selection, id));

  const updateSizeFromElement = () =>{
      if (nodeRef.current != null) {
        nodeRef.current.style.width = "unset";
        nodeRef.current.style.height = "unset";
        const bounds = nodeRef.current.getBoundingClientRect();
        if (
          Math.abs(sY - bounds.height / scale) > 10 || // Padding is 10 on each side
          Math.abs(sX - bounds.width / scale) > 10 
        ) {
          dispatch(
            updateSize.action({
              id,
              type: BoardObjects.BOARD,
              sX: bounds.width / scale,
              sY: bounds.height / scale,
            })
          );
        }
        nodeRef.current.style.width = sX;
        nodeRef.current.style.height = sY;
      }
    };

  // updateSizeFromElement();

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
      sX={sX}
      sY={sY}
      parentId={parent.id}
      parentType={parent.type}
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
        <StarIcon pointerEvents={"none"} />
      </div>
      <CustomEditablePreview
        as={"p"}
        canEdit={selected}
        text={title}
        textStyle={previewStyle}
        changeOnSubmit
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
