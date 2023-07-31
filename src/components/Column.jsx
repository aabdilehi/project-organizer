/** @jsxImportSource @emotion/react */
import { useContext, useRef } from "react";
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

  //#region Drag behaviour

  const item = {
    id,
    type: BoardObjects.COLUMN,
    parent: parent,
  };

  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  const { handleDragStart, handleDrag, handleDragEnd, animate } = useSmoothDrag(
    {
      boardId,
      boardRef,
      elementRef: dragRef,
      initialCoords: { x: pX, y: pY },
      shouldAnimate: true,
      shouldPosition: true,
      item,
      offset,
      scale,
    }
  );

  animate();

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

  const { setMenuItems, setMenuProps, copiedNodes, copyNodes } =
    useContext(ContextMenuContext);

  const copyColumn = () => {
    const column = {
      // new Id will be assigned
      type: BoardObjects.COLUMN,
      pX, // need position in case user uses keyboard shortcut
      pY,
      sX,
      sY,
      title,
      // parent does not have to be the same
    };
    copyNodes([column]);
  };

  const cutColumn = () => {
    copyColumn();
    deleteColumn(boardId, id);
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

  const updateContextMenu = () => {
    setMenuItems([
      <MenuItem onClick={pasteNodes}>Paste</MenuItem>,
      <MenuItem onClick={cutColumn}>Cut</MenuItem>,
      <MenuItem onClick={copyColumn}>Copy</MenuItem>,
      <MenuItem onClick={() => deleteColumn(boardId, id)}>Delete</MenuItem>,
    ]);
    setMenuProps({
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
    });
  };

  //#endregion

  return (
    <ResizeObserver
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
    >
      <Card
        ref={dragRef}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDragOver={allowDrop}
        onDrop={drop}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateContextMenu();
          openContextMenu(e);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleSelectNode(e, {
            id, // new Id will be assigned
            type: BoardObjects.COLUMN,
            pX, // need position in case user uses keyboard shortcut
            pY,
            sX,
            sY,
            title,
            parent,
            // parent does not have to be the same
          });
        }}
        zIndex={2}
        w={sX + "px"}
        direction={{ base: "column" }}
        alignItems="center"
        color={"white"}
        p={1}
        minW="300px"
        maxW="1000px"
        minH="120px"
        resize="horizontal"
        overflow="hidden"
        rounded={"sm"}
        bgColor={useColorModeValue("gray.300", "gray.700")}
        outline={!!selectedNode[id] ? "3px solid" : "1px solid"}
        outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
        cursor={"grab"}
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
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      columnRef={dragRef}
                      offset={offset}
                      scale={scale}
                      openContextMenu={openContextMenu}
                    />
                  );
                case BoardObjects.IMAGE:
                  return (
                    <Picture
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                      openContextMenu={openContextMenu}
                    />
                  );
                case BoardObjects.TODO:
                  return (
                    <ToDo
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                      openContextMenu={openContextMenu}
                    />
                  );
                case BoardObjects.BOARD:
                  return (
                    <BoardIcon
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                      openContextMenu={openContextMenu}
                    />
                  );
                case BoardObjects.DOCUMENT:
                  return (
                    <Document
                      key={childId}
                      boardId={boardId}
                      id={childId}
                      boardRef={boardRef}
                      offset={offset}
                      scale={scale}
                      openContextMenu={openContextMenu}
                    />
                  );
                default:
                  break;
              }
            })}
          </Stack>
        </CardBody>
      </Card>
    </ResizeObserver>
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
