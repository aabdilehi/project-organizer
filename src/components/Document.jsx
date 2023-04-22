import { Button } from "@chakra-ui/button";
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
import { Textarea } from "@chakra-ui/textarea";
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
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { bindActionCreators } from "redux";
import {
  updateContent,
  updateTitle,
  updateDocumentParent,
  toggleExpanded,
  removeDocument,
} from "../slices/docSlice";
import { MenuBar } from "./Editor";
import { connect } from "react-redux";
import { BoardObjects } from "../enums/items";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { Card, CardBody } from "@chakra-ui/card";
import { IconFileText } from "@tabler/icons-react";
import { Editable } from "@chakra-ui/editable";
import CustomEditablePreview from "./CustomEditablePreview";
import { AutoResizeEditableInput } from "./AutoResizeTextarea";
import {
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import { ContextMenuContext, useContextMenu } from "../hooks/useContextMenu";
import { addBoardChild, removeBoardChild } from "../slices/boardSlice";
import { addColumnChild, removeColumnChild } from "../slices/columnSlice";
import { addNote } from "../slices/noteSlice";

const Document = ({
  id,
  boardId,
  boardRef,
  offset,
  scale,
  pX,
  pY,
  expanded,
  title,
  content,
  parent,
  setContextMenu,
  openContextMenu,
  updateContent,
  updateTitle,
  addBoardChild,
  removeBoardChild,
  addColumnChild,
  removeColumnChild,
  addNote,
  removeDocument,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isInColumn, setIsInColumn] = useState(false);
  const dragRef = useRef(null);

  //#region Drag hook
  const item = {
    id: id,
    type: BoardObjects.DOCUMENT,
    parent: parent,
  };

  const { handleDragStart, handleDrag, handleDragEnd, animate } = useSmoothDrag(
    {
      boardId,
      boardRef,
      elementRef: dragRef,
      initialCoords: { x: pX, y: pY },
      shouldAnimate: true,
      shouldPosition: !isInColumn,
      item,
      offset,
      scale,
    }
  );

  animate();

  //#endregion

  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
      console.log(isInColumn);
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
      updateContent({ documentId: id, content: editor.getHTML() });
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

  const deleteDocument = () => {
    console.log("deleting note");
    switch (parent.type) {
      case BoardObjects.BOARD:
        removeBoardChild({ boardId: parent.id, childId: id });
        removeDocument({ documentId: id });
        break;
      case BoardObjects.COLUMN:
        removeColumnChild({ columnId: parent.id, childId: id });
        removeDocument({ documentId: id });
        break;
    }
  };

  const convertDocument = () => {
    console.log("HIII");
    const newNote = {
      id: id,
      type: BoardObjects.NOTE,
      pX: pX ? pX : 0,
      pY: pY ? pY : 0,
      sX: 200,
      sY: 200,
      content,
      parent,
    };
    switch (parent.type) {
      case BoardObjects.BOARD:
        removeBoardChild({ boardId: parent.id, childId: id });
        removeDocument({ documentId: id });
        addNote(newNote);
        addBoardChild({
          boardId: parent.id,
          childId: id,
          childType: BoardObjects.NOTE,
        });
        break;
      case BoardObjects.COLUMN:
        removeColumnChild({ columnId: parent.id, childId: id });
        removeDocument({ documentId: id });
        addNote(newNote);
        addColumnChild({
          columnId: parent.id,
          childId: id,
          childType: BoardObjects.NOTE,
        });
        break;
      default:
        break;
    }
  };

  const { setMenuItems, copyNodes } = useContext(ContextMenuContext);

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
    deleteDocument();
  };

  const updateContextMenu = () => {
    setMenuItems([
      <MenuItem onClick={cutDocument}>Cut</MenuItem>,
      <MenuItem onClick={copyDocument}>Copy</MenuItem>,
      <MenuItem onClick={deleteDocument}>Delete</MenuItem>,
      <MenuDivider />,
      <MenuItem onClick={convertDocument}>Convert to note</MenuItem>,
    ]);
  };

  return (
    <>
      <Card
        ref={dragRef}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateContextMenu();
          openContextMenu(e);
        }}
        zIndex={2}
        p={isInColumn ? 1.5 : 0}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        direction={isInColumn ? "row" : "column"}
        alignItems={"center"}
        bgColor={
          isInColumn ? useColorModeValue("gray.400", "gray.800") : "transparent"
        }
        outline={isInColumn ? "1px solid" : "none"}
        outlineColor={
          isInColumn
            ? useColorModeValue("blackAlpha.500", "whiteAlpha.300")
            : "none"
        }
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
          outline="1px solid"
          outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
          rounded={"md"}
        >
          <IconFileText pointerEvents={"none"} w={"100%"} h={"100%"} />
        </CardBody>
        <Editable
          flex={isInColumn ? 1 : undefined}
          onChange={(value) => updateTitle({ documentId: id, title: value })}
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
      </Card>
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
      updateContent,
      updateTitle,
      toggleExpanded,
      updateDocumentParent,
      addBoardChild,
      removeBoardChild,
      addColumnChild,
      removeColumnChild,
      addNote,
      removeDocument,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Document);
