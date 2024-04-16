/** @jsxImportSource @emotion/react */
import { useContext, useRef } from "react";
import { BoardObjects, SidebarObjects } from "../utils/enums/items";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";

import Note from "./Note";
import { Editable, EditableInput, useColorModeValue } from "@chakra-ui/react";
import CustomEditablePreview from "./CustomEditablePreview";
import { useColumnDrop } from "../utils/hooks/useDrop";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import { addChild, addNode, updateTitle } from "../utils/slices/nodeActions";
import ResizeWrapper from "./ResizeWrapper";

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
  openContextMenu,
}) => {
  const dragRef = useRef(null);
  const columnRef = useRef(null);

  const dispatch = useDispatch();

  //#region Drop behaviour

  const { drop, allowDrop } = useColumnDrop({
    accept: [
      BoardObjects.NOTE,
      BoardObjects.TODO,
      BoardObjects.IMAGE,
      BoardObjects.BOARD,
      BoardObjects.DOCUMENT,
      SidebarObjects.NOTE,
      SidebarObjects.IMAGE,
      SidebarObjects.TODO,
      SidebarObjects.BOARD,
      SidebarObjects.DOCUMENT,
    ],
    boardId,
    columnId: id,
    boardRef,
    position: offset,
    scale,
  });

  //#endregion

  const { setMenuItems, setMenuProps } = useContext(ContextMenuContext);
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

  const updateContextMenu = () => {
    setMenuItems([]);
    setMenuProps({
      canCopy: true,
      canCut: true,
      canDelete: true,
      canPaste: true,
      paste: (nodes) => {
        pasteNodes(nodes);
      },
    });
  };

  //#endregion

  return (
    <div
      ref={dragRef}
      draggable
      style={{
        position: "absolute",
        transform: `translate(${pX}px, ${pY}px)`,
        zIndex: 2,
        width: sX + "px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "white",
        padding: "4px",
        minWidth: "300px",
        maxWidth: "1000px",
        resize: "horizontal",
        overflow: "hidden",
        borderRadius: "12px",
        backgroundColor: "magenta",
        outline: !!selectedNodes[id] ? "3px solid green" : "1px solid grey",
        cursor: "grab",
      }}
      onDragOver={(event) => {
        allowDrop(event);
      }}
      onDrop={(event) => {
        drop(event);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        updateContextMenu();
        openContextMenu(e);
      }}
    >
      <ResizeWrapper onResize={() => {}}>
        <div style={{ width: "100%", padding: "6px" }}>
          <Editable
            as="h2"
            fontSize="larger"
            fontWeight="800"
            color={useColorModeValue("black", "white")}
            value={title}
            textAlign="center"
            isPreviewFocusable={false}
          >
            <CustomEditablePreview
              canEdit={!!selectedNodes[id]}
              color={useColorModeValue("black", "white")}
              fontSize="larger"
              fontWeight="800"
            />
            <EditableInput
              fontSize="larger"
              overflow={"hidden"}
              onChange={(e) =>
                dispatch(
                  updateTitle.action({
                    id,
                    type: BoardObjects.COLUMN,
                    title: e.target.value,
                  })
                )
              }
            />
          </Editable>
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
      </ResizeWrapper>
    </div>
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
