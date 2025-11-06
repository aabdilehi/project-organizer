/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useEffect, useRef, useState } from "react";
import IconButton from "./Modular/IconButton.tsx";
import { TbEdit } from "react-icons/tb";

const ImagePreview = ({ id }) => {
  const nodeRef = useRef();
  const { pX, pY, sX, sY, imageId, parent } = useSelector(
    (state) => state.images[id] ?? state.drag.nodes[id]
  );
  const image = useSelector((state) => state.imageMap[imageId] ?? "");

  return (
    <>
      <NodeWrapper
        ref={nodeRef}
        id={id}
        type={BoardObjects.IMAGE}
        preview
        canPosition={true}
        canResize={true}
        pX={pX}
        pY={pY}
        sX={sX}
        sY={sY}
        parentId={parent.id}
        parentType={parent.type}
      >
        <img
          src={image}
          style={{
            width: "100%",
            pointerEvents: "none",
          }}
        />
        <IconButton
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "25px",
            width: "25px",
            borderRadius: "6px",
            alignItems: "center",
            justifyContent: "center",
          }}
          icon={TbEdit}
        />
      </NodeWrapper>
    </>
  );
};

export default ImagePreview;
