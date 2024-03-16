/** @jsxImportSource @emotion/react */
import { useContext, useEffect, useRef } from "react";
import { BoardObjects, SidebarObjects } from "../utils/enums/items";
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
import CustomEditablePreview from "./CustomEditablePreview";
import Picture from "./Picture";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
import { useColumnDrop } from "../utils/hooks/useDrop";
import ToDo from "./ToDo";
import BoardIcon from "./BoardIcon";
import { AutoResizeEditableInput } from "./AutoResizeTextarea";
import Document from "./Document";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import { SelectedNodeContext } from "../App";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updateSize,
  updateTitle,
} from "../utils/slices/nodeActions";
import NodeWrapper from "./NodeWrapper";

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
  handleDragStart,
  handleDrag,
  handleDragEnd,
  animate,
}) => {
  const columnRef = useRef(null);

  const dispatch = useDispatch();

  //#region Drag behaviour

  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  //#endregion

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

  const { setMenuItems, setMenuProps } = useContext(ContextMenuContext);

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
      nodeId={id}
      canPosition={true}
      canResize={true}
      pX={pX}
      pY={pY}
      handleDragStart={handleDragStart}
      handleDrag={handleDrag}
      handleDragEnd={handleDragEnd}
      animate={animate}
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
      onSelectNode={{
        id, // new Id will be assigned
        type: BoardObjects.COLUMN,
        pX, // need position in case user uses keyboard shortcut
        pY,
        sX,
        sY,
        title,
        parent,
        childRefs,
        // parent does not have to be the same
      }}
      clickCallback={() => {}}
      holdCallback={() => {}}
      openContextMenu={openContextMenu}
      parent={parent}
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
      onDragOver={allowDrop}
      onDrop={drop}
      zIndex={2}
      w={sX + "px"}
      direction={{ base: "column" }}
      alignItems="center"
      p={1}
      minW="300px"
      maxW="1000px"
      minH="120px"
      resize="horizontal"
      overflow="hidden"
      rounded={"sm"}
    >
      <CardHeader draggable={false} p={1.5}>
        <Editable
          draggable={false}
          as="h2"
          fontSize="larger"
          fontWeight="800"
          color={useColorModeValue("black", "white")}
          value={title}
          textAlign="center"
          isPreviewFocusable={false}
        >
          <CustomEditablePreview
            canEdit={!!selectedNode[id]}
            draggable={false}
            color={useColorModeValue("black", "white")}
            fontSize="larger"
            fontWeight="800"
          />
          <AutoResizeEditableInput
            draggable={false}
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
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={animate}
                  />
                );
              case BoardObjects.IMAGE:
                return (
                  <Picture
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={animate}
                  />
                );
              case BoardObjects.TODO:
                return (
                  <ToDo
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={animate}
                  />
                );
              case BoardObjects.BOARD:
                return (
                  <BoardIcon
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
                    animate={animate}
                  />
                );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    handleDragStart={handleDragStart}
                    handleDrag={handleDrag}
                    handleDragEnd={handleDragEnd}
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
