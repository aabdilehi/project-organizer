/** @jsxImportSource @emotion/react */
import { useContext, useMemo, useRef } from "react";
import { BoardObjects, SidebarObjects } from "../utils/enums/items";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";

import Note from "./Note";
import { Editable, EditableInput, useColorModeValue } from "@chakra-ui/react";

import CustomEditablePreview2 from "./CustomEditablePreview.tsx";
import { addChild, addNode, updateTitle } from "../utils/slices/nodeActions";
import ResizeWrapper from "./ResizeWrapper";
import NodeWrapper from "./NodeWrapper.tsx";

const previewStyle = {
  fontWeight: "800",
};

const Column = ({
  id,
  boardId,
  boardRef,
  pX,
  pY,
  offset,
  scale,
  sX,
  sY,
  title,
  childRefs,
  parent,
  clearPortal,
  draggedNodes,
  drop,
  allowDrop,
  openContextMenu,
}) => {
  const dragRef = useRef(null);
  const columnRef = useRef(null);

  const dispatch = useDispatch();

  const selectedNodes = useSelector((state) => state.selection);

  const pasteNodes = (nodes) => {
    nodes.forEach((node) => {
      let copiedNode;
      switch (node.type) {
        case BoardObjects.NOTE:
          copiedNode = {
            ...node,
            pX: 0,
            pY: 0,
            parent: !!node.parent
              ? node.parent
              : { id: id, type: BoardObjects.COLUMN },
          };
          break;
        case BoardObjects.DOCUMENT:
          copiedNode = {
            ...node,
            pX: 0,
            pY: 0,
            parent: !!node.parent
              ? node.parent
              : { id: id, type: BoardObjects.COLUMN },
          };
          break;
        case BoardObjects.IMAGE:
          copiedNode = {
            ...node,
            pX: 0,
            pY: 0,
            parent: !!node.parent
              ? node.parent
              : { id: id, type: BoardObjects.COLUMN },
          };
          break;
        case BoardObjects.TODO:
          copiedNode = {
            ...node,
            pX: 0,
            pY: 0,
            parent: !!node.parent
              ? node.parent
              : { id: id, type: BoardObjects.COLUMN },
          };
          break;
        case BoardObjects.BOARD:
          copiedNode = {
            ...node,
            pX: 0,
            pY: 0,
            parent: !!node.parent
              ? node.parent
              : { id: id, type: BoardObjects.COLUMN },
            childRefs: [],
          };
          break;
        default:
          break;
      }
      if (!!copiedNode) {
        dispatch(addNode.action(copiedNode));
        dispatch(
          addChild.action({
            id,
            type: BoardObjects.COLUMN,
            cId: copiedNode.id,
            cType: copiedNode.type,
          })
        );
      }
    });
  };

  //#endregion
  const selectData = useMemo(() => {
    return {
      id, // new Id will be assigned
      type: BoardObjects.COLUMN,
      parent,
    };
  }, [id, parent]);

  return (
    <NodeWrapper
      canPosition={true}
      canResize={false}
      id={id}
      type={"column"}
      pX={pX}
      pY={pY}
      sX={sX}
      openContextMenu={openContextMenu}
      onSelectNode={selectData}
      menuProps={{
        canCopy: true,
        canCut: true,
        canPaste: true,
        canDelete: true,
      }}
      onDragOver={(event) => {
        allowDrop(event, id);
      }}
      onDrop={(event) => {
        drop(event, id);
      }}
    >
      <div style={{ maxWidth: "100%", padding: "6px" }}>
        <CustomEditablePreview2
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
      </div>
      <div
        ref={columnRef}
        style={{
          width: "100%",
          alignItems: "center",
          border: "2px dashed grey",
          borderRadius: "12px",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {childRefs.map(({ childId, childType }) => {
          switch (childType) {
            case BoardObjects.NOTE:
              return <Note key={childId} id={childId} />;
            default:
              break;
          }
        })}
      </div>
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
