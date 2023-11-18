/** @jsxImportSource @emotion/react */
import { useContext, useEffect, useRef } from "react";
import { BoardObjects, SidebarObjects } from "../../utils/enums/items";
import { v4 as uuidv4 } from "uuid";
import ResizeObserver from "rc-resize-observer";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";

import Note from "./Note";
import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  Editable,
  useColorModeValue,
  MenuItem,
} from "@chakra-ui/react";
import CustomEditablePreview from "../Other/CustomEditablePreview";
import Picture from "./Picture";
import { useSmoothDrag } from "../../utils/hooks/useSmoothDrag";
import { useColumnDrop } from "../../utils/hooks/useDrop";
import ToDo from "./ToDo";
import BoardIcon from "./BoardIcon";
import { AutoResizeEditableInput } from "../Other/AutoResizeTextarea";
import Document from "./Document";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updateSize,
  updateTitle,
} from "../../utils/slices/nodeActions";
import NodeWrapper from "./NodeWrapper";

const Column = ({
  id,
  boardId,
  boardRef,
  animate,
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
  const columnRef = useRef(null);

  const selectedNodes = useSelector((state) => state.selection);

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

  //#region Context Menu
  const boards = useSelector((state) => state.boards);
  const deleteBoardChildren = (id) => {
    const board = boards[id];
    board?.childRefs.forEach(({ childId, childType }) => {
      switch (childType) {
        case BoardObjects.BOARD:
          deleteBoardChildren(childId);
          dispatch(
            removeChild.action({ id, type: BoardObjects.BOARD, cId: childId })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
          break;
        case BoardObjects.COLUMN:
        case BoardObjects.NOTE:
        case BoardObjects.DOCUMENT:
        case BoardObjects.TODO:
        case BoardObjects.IMAGE:
          dispatch(
            removeChild.action({ id, type: BoardObjects.BOARD, cId: childId })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
          break;
        default:
          break;
      }
    });
  };

  const deleteColumn = (boardId, colId) => {
    childRefs.forEach(({ childId, childType }) => {
      switch (childType) {
        case BoardObjects.BOARD:
          deleteBoardChildren(childId);
          dispatch(
            removeChild.action({
              id: colId,
              type: BoardObjects.COLUMN,
              cId: childId,
            })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
          break;
        case BoardObjects.NOTE:
        case BoardObjects.DOCUMENT:
        case BoardObjects.TODO:
        case BoardObjects.IMAGE:
          dispatch(
            removeChild.action({
              id: colId,
              type: BoardObjects.COLUMN,
              cId: childId,
            })
          );
          dispatch(removeNode.action({ id: childId, type: childType }));
          break;
        default:
          break;
      }
    });

    dispatch(
      removeChild.action({ id: boardId, type: BoardObjects.BOARD, cId: colId })
    );
    dispatch(removeNode.action({ id: colId, type: BoardObjects.COLUMN }));
  };

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

  return (
    <NodeWrapper
      onResize={({ width, height }) => {
        dispatch(
          updateSize.action({
            id,
            type: BoardObjects.COLUMN,
            sX: width,
            sY: height,
          })
        );
      }}
      nodeId={id}
      nodeType={BoardObjects.COLUMN}
      animate={animate}
      canPosition={true}
      canResize={true}
      direction={{ base: "column" }}
      openContextMenu={openContextMenu}
      rounded={"sm"}
      menuItems={[]}
      menuProps={{
        canCopy: true,
        canCut: true,
        canDelete: true,
        canPaste: true,
        delete: () => {
          deleteColumn(boardId, id);
        },
        paste: (nodes) => {
          pasteNodes(nodes);
        },
      }}
      pX={pX}
      pY={pY}
      onDragOver={allowDrop}
      onDrop={drop}
      style={{
        zIndex: 2,
        minWidth: "300px",
        maxWidth: "1000px",
        width: sX + "px",
        minHeight: "120px",
        resize: "horizontal",
        overflow: "hidden",
        alignItems: "center",
        // color: "white",
        padding: 4,
        cursor: "grab",
      }}
      clickCallback={() => {}}
      holdCallback={() => {}}
      parent={parent}
    >
      <CardHeader draggable p={1.5}>
        <Editable
          draggable
          as="h2"
          fontSize="larger"
          fontWeight="800"
          color={useColorModeValue("black", "white")}
          value={title}
          textAlign="center"
          isPreviewFocusable={false}
          //pointerEvents={!!selectedNodes[id] ? "unset" : "none"}
        >
          <CustomEditablePreview
            canEdit={true}
            draggable
            color={useColorModeValue("black", "white")}
            fontSize="larger"
            fontWeight="800"
          />
          <AutoResizeEditableInput
            draggable
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
      </CardHeader>
      <CardBody
        draggable={false}
        ref={columnRef}
        w="calc(100%)"
        alignItems="center"
        border="2px dashed"
        borderColor="gray.600"
        p={0}
        rounded="md"
      >
        <Stack direction="column" w="full">
          {childRefs.map(({ childId, childType }) => {
            switch (childType) {
              case BoardObjects.NOTE:
                return (
                  <Note
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    animate={animate}
                  />
                );
              // case BoardObjects.IMAGE:
              //   return (
              //     <Picture
              //       key={childId}
              //       boardId={boardId}
              //       id={childId}
              //       boardRef={boardRef}
              //       offset={offset}
              //       scale={scale}
              //       openContextMenu={openContextMenu}
              //     />
              //   );
              case BoardObjects.TODO:
                return (
                  <ToDo
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    animate={animate}
                  />
                );
              // case BoardObjects.BOARD:
              //   return (
              //     <BoardIcon
              //       key={childId}
              //       boardId={boardId}
              //       id={childId}
              //       boardRef={boardRef}
              //       offset={offset}
              //       scale={scale}
              //       openContextMenu={openContextMenu}
              //     />
              //   );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    animate={animate}
                  />
                );
              default:
                break;
            }
          })}
        </Stack>
      </CardBody>
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
