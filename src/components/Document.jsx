import { useColorModeValue } from "@chakra-ui/color-mode";
import { useDisclosure } from "@chakra-ui/hooks";
import "../editor.scss";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@chakra-ui/modal";
import Color from "@tiptap/extension-color";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import ListItem from "@tiptap/extension-list-item";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useContext, useEffect, useRef, useState } from "react";
import { bindActionCreators } from "redux";
import { toggleExpanded } from "../utils/slices/docSlice";
import { MenuBar } from "./Editor";
import { connect, useDispatch } from "react-redux";
import { BoardObjects } from "../utils/enums/items";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
import { Card, CardBody } from "@chakra-ui/card";
import { IconFileText } from "@tabler/icons-react";
import { Editable } from "@chakra-ui/editable";
import CustomEditablePreview from "./CustomEditablePreview";
import { AutoResizeEditableInput } from "./AutoResizeTextarea";
import { MenuDivider, MenuItem } from "@chakra-ui/react";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import { SelectedNodeContext } from "../App";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updateContent,
  updateTitle,
} from "../utils/slices/nodeActions";
import { NoteC } from "../utils/classes/classes";
import NodeWrapper from "./NodeWrapper";

const Document = ({
  id,
  pX,
  pY,
  expanded,
  title,
  content,
  parent,
  setContextMenu,
  openContextMenu,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  animate,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isInColumn, setIsInColumn] = useState(false);
  const dragRef = useRef(null);
  const dispatch = useDispatch();
  //#region Drag hook
  const item = {
    id: id,
    type: BoardObjects.DOCUMENT,
    parent: parent,
  };

  if (!!animate) animate();

  //#endregion

  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
    }
  }, [parent]);

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: undefined,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      dispatch(
        updateContent.action({
          id,
          type: BoardObjects.DOCUMENT,
          content: editor.getHTML(),
        })
      );
    },
  });

  useEffect(() => {
    if (!editor) return;
    let { from, to } = editor.state.selection;
    editor.commands.setContent(content, false, {
      preserveWhitespace: "full",
    });
    editor.commands.setTextSelection({ from, to });
  }, [content, editor]);

  const convertDocument = () => {
    const { ...newNote } = new NoteC({
      id,
      pX,
      pY,
      content,
      parent,
    });
    dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
    dispatch(removeNode.action({ id, type: BoardObjects.DOCUMENT }));
    dispatch(addNode.action(newNote));
    dispatch(
      addChild.action({
        id: parent.id,
        type: parent.type,
        cId: id,
        cType: BoardObjects.NOTE,
      })
    );
  };

  const { setMenuItems, setMenuProps, copyNodes } =
    useContext(ContextMenuContext);

  const copyDocument = () => {
    const document = {
      // new Id will be assigned
      type: BoardObjects.DOCUMENT,
      pX, // need position in case user uses keyboard shortcut
      pY,
      title,
      content,
      expanded,
      // parent does not have to be the same
    };
    copyNodes([document]);
  };

  const cutDocument = () => {
    copyDocument();
  };

  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  return (
    <>
      <NodeWrapper
        nodeId={id}
        canPosition={true}
        canResize={false}
        pX={pX}
        pY={pY}
        handleDragStart={handleDragStart}
        handleDrag={handleDrag}
        handleDragEnd={handleDragEnd}
        animate={animate}
        openContextMenu={openContextMenu}
        isInColumn={isInColumn}
        onSelectNode={{
          id, // new Id will be assigned
          type: BoardObjects.DOCUMENT,
          pX, // need position in case user uses keyboard shortcut
          pY,
          title,
          content,
          expanded,
          parent, // parent does not have to be the same
        }}
        clickCallback={() => {}}
        holdCallback={() => {}}
        bg={"none"}
        outline={"none"}
        menuProps={{
          canCopy: true,
          canCut: true,
          canDelete: true,
        }}
        menuItems={[
          <MenuItem onClick={convertDocument}>Convert to note</MenuItem>,
        ]}
        zIndex={2}
        p={isInColumn ? 1.5 : 0}
        direction={isInColumn ? "row" : "column"}
        alignItems={"center"}
        border={"none"}
        rounded={"sm"}
        variant={"filled"}
        w={isInColumn ? "full" : undefined}
        minW={isInColumn ? "100%" : undefined}
      >
        <CardBody
          flex={isInColumn ? 0.12 : undefined}
          cursor={"grab"}
          onDoubleClick={onOpen}
          h={"65px"}
          w={"65px"}
          bg={
            isInColumn
              ? useColorModeValue("gray.300", "gray.700")
              : useColorModeValue("gray.400", "gray.800")
          }
          outline={!!selectedNode[id] ? "3px solid" : "1px solid"}
          outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
          rounded={"md"}
        >
          <IconFileText pointerEvents={"none"} w={"100%"} h={"100%"} />
        </CardBody>
        <Editable
          flex={isInColumn ? 1 : undefined}
          onChange={(value) =>
            dispatch(
              updateTitle.action({
                id,
                type: BoardObjects.DOCUMENT,
                title: value,
              })
            )
          }
          m={0}
          mt={isInColumn ? undefined : 1.5}
          p={0}
          h={"full"}
          width={isInColumn ? "100%" : "100px"}
          textAlign={"center"}
          wordBreak="break-word"
          placeholder="Board"
          isPreviewFocusable={false}
          value={title}
          color={useColorModeValue("black", "white")}
        >
          <CustomEditablePreview cursor={"text"} w={"83%"} m={0} p={0} />
          <AutoResizeEditableInput
            maxW={isInColumn ? undefined : "100px"}
            w={"unset"}
            m={0}
            p={0}
            textAlign={"center"}
            required={true}
          />
        </Editable>
      </NodeWrapper>
      <Modal
        colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
        size={"4xl"}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent rounded={"sm"}>
          <ModalHeader
            backgroundColor={useColorModeValue(
              "blackAlpha.100",
              "blackAlpha.200"
            )}
            dropShadow={"dark-lg"}
            m={0}
            p={2}
          >
            <MenuBar editor={editor} />
          </ModalHeader>
          <ModalBody rounded={"sm"} roundedTop={"none"} p={0} m={0}>
            <EditorContent
              style={{
                height: "fit-content",
                minHeight: "70vh",
                padding: 0,
                margin: 0,
                border: "none",
                outline: "none",
              }}
              editor={editor}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const doc = state.documents[id];
  return {
    pX: doc.pX,
    pY: doc.pY,
    expanded: doc.expanded, // icon vs card view (not anything to do with opening the modal)
    title: doc.title,
    content: doc.content,
    parent: doc.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      toggleExpanded,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Document);
