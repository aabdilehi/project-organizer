/** @jsxImportSource @emotion/react */
import { useLayoutEffect, useRef, useState } from "react";
import { BoardObjects } from "../utils/enums/items";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";

import Note from "./Note";

import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import { updateTitle } from "../utils/slices/nodeActions";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import BoardIcon from "./BoardIcon.jsx";
import Document from "./Document.jsx";

const previewStyle = {
  fontWeight: "800",
  borderRadius: "10px",
};

const Column = ({
  id,
  pX,
  pY,
  sX,
  title,
  childRefs,
  parent,
  drop,
  allowDrop,
  dropOnBoard,
  allowDropOnBoard,
}) => {
  const nodeRef = useRef();
  const columnRef = useRef();

  const dispatch = useDispatch();

  const selectedNodes = useSelector((state) => state.selection);

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

  //#endregion

  return (
    <NodeWrapper
      ref={nodeRef}
      canPosition={true}
      canResize={false}
      id={id}
      type={"column"}
      parent={parent}
      pX={pX}
      pY={pY}
      sX={sX}
      onDragOver={(event) => {
        allowDrop(event, id);
      }}
      onDrop={(event) => {
        drop(event, id);
      }}
    >
      <CustomEditablePreview
        as={"h1"}
        canEdit={!!selectedNodes[id]}
        text={title}
        textStyle={previewStyle}
        onChange={(value) =>
          dispatch(
            updateTitle.action({
              id,
              type: BoardObjects.COLUMN,
              title: value,
            })
          )
        }
      />
      <span
        ref={columnRef}
        style={{
          width: "100%",
          alignItems: "center",
          border: "2px dashed grey",
          borderRadius: "12px",
          minHeight: childRefs.length > 0 ? undefined : "80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {childRefs.map(({ childId, childType }) => {
          switch (childType) {
            case BoardObjects.NOTE:
              return <Note key={childId} id={childId} />;
            case BoardObjects.BOARD:
              return (
                <BoardIcon
                  key={childId}
                  id={childId}
                  drop={dropOnBoard}
                  allowDrop={allowDropOnBoard}
                />
              );
            case BoardObjects.DOCUMENT:
              return <Document key={childId} id={childId} />;
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
  const column = state.columns[id];
  return {
    title: column.title,
    childRefs: column.childRefs,
    pX: column.pX,
    pY: column.pY,
    sX: column.sX,
    sY: column.sY,
    parent: column.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Column);
