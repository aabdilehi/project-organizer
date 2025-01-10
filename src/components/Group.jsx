/** @jsxImportSource @emotion/react */
import "../App.css";
import { useRef } from "react";

import "../editor.scss";
import { useDispatch, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import { BoardObjects } from "../utils/enums/items.tsx";
import { updateTitle } from "../utils/slices/nodeActions.ts";

const previewStyle = {
  fontWeight: "800",
  borderRadius: "5px",
};

const Group = ({ id, onContextMenu, scale, offset }) => {
  const nodeRef = useRef();
  const dispatch = useDispatch();

  const { pX, pY, sX, sY, title, parent } = useSelector(
    (state) => state.groups[id]
  );

  const selected = useSelector((state) => Object.hasOwn(state.selection, id));

  return (
    <NodeWrapper
      ref={nodeRef}
      id={id}
      type={"group"}
      canPosition={true}
      canResize={true}
      pX={pX}
      pY={pY}
      sX={sX}
      sY={sY}
      scale={scale}
      offset={offset}
      parentId={parent.id}
      parentType={parent.type}
      isInColumn={false}
      onContextMenu={onContextMenu}
    >
      <CustomEditablePreview
        as={"p"}
        canEdit={selected}
        text={title}
        textStyle={previewStyle}
        onChange={(value) =>
          dispatch(
            updateTitle.action({
              id,
              type: BoardObjects.GROUP,
              title: value,
            })
          )
        }
      />
    </NodeWrapper>
  );
};

export default Group;
