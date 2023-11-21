/** @jsxImportSource @emotion/react */
import { useRef } from "react";
import { BoardObjects, SidebarObjects } from "../../utils/enums/items";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";

import Note from "./Note";
import {
  CardHeader,
  CardBody,
  Stack,
  Editable,
  useColorModeValue,
} from "@chakra-ui/react";
import CustomEditablePreview from "../Other/CustomEditablePreview";
import { useColumnDrop } from "../../utils/hooks/useDrop";
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
import BoardIcon from "./BoardIcon";

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
  parentId,
  parentType,
  openContextMenu,
}) => {
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
      parentId={parentId}
      parentType={parentType}
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
                    parentId={id}
                    parentType={"column"}
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
              // case BoardObjects.TODO:
              //   return (
              //     <ToDo
              //       key={childId}
              //       id={childId}
              //       openContextMenu={openContextMenu}
              //       animate={animate}
              //     />
              //   );
              case BoardObjects.BOARD:
                return (
                  <BoardIcon
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    parentId={id}
                    parentType={"column"}
                    animate={animate}
                  />
                );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={childId}
                    id={childId}
                    openContextMenu={openContextMenu}
                    parentId={id}
                    parentType={"column"}
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Column);
