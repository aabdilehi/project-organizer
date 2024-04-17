/** @jsxImportSource @emotion/react */
import "../App.css";
import { useState, useEffect, useRef, useMemo } from "react";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { ListItem, MenuItem } from "@chakra-ui/react";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent, useEditor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useContext } from "react";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updateContent,
} from "../utils/slices/nodeActions";
import { DocumentC } from "../utils/classes/classes";
import NodeWrapper from "./NodeWrapper";

const Note = ({ id, pX, pY, sX, sY, content, parent, openContextMenu }) => {
  const selectedNodes = useSelector((state) => state.selection);
  const dispatch = useDispatch();

  const isDragging = useRef(false);

  const selectData = useMemo(() => {
    return {
      id, // new Id will be assigned
      type: BoardObjects.NOTE,
      parent,
    };
  }, [id, parent]);

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
          type: BoardObjects.NOTE,
          content: editor.getHTML(),
        })
      );
    },
    editable: false, // set to false by default then enable on single click
  });

  const handleClick = (event) => {
    if (event.button === 0) {
      if (!editor) {
        return;
      }

      // Set to edit mode
      if (!event.ctrlKey) {
        editor.setEditable(true);
        editor.commands.focus();
        return;
      }
    }
  };
  // Update text and maintain cursor position on re-render
  useEffect(() => {
    editor?.commands.setContent(content, false, {
      preserveWhitespace: "full",
    });
  }, [content]);
  if (!!editor) {
    // only allow editing text on selected node
    editor.setEditable(false);

    let { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
  }

  // Determines sizing and positioning based on whether in column or not
  let isInColumn = parent.type === BoardObjects.COLUMN;

  const convertNote = () => {
    const { ...newDocument } = new DocumentC({
      id,
      pX,
      pY,
      title: `${editor?.getText().slice(0, 10)}...`,
      content,
      parent,
    });

    dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
    dispatch(removeNode.action({ id, type: BoardObjects.NOTE }));
    dispatch(addNode.action(newDocument));
    dispatch(
      addChild.action({
        id: parent.id,
        type: parent.type,
        cId: id,
        cType: BoardObjects.DOCUMENT,
      })
    );
  };

  return (
    <NodeWrapper
      nodeId={id}
      nodeType={"note"}
      canPosition={!editor?.isEditable}
      pX={pX}
      pY={pY}
      sX={sX}
      sY={sY}
      openContextMenu={openContextMenu}
      isInColumn={isInColumn}
      clickCallback={handleClick}
      onBlur={() => {
        editor?.setEditable(false);
      }}
      h={editor?.isEditable ? "unset" : sY + "px"}
      overflow={editor?.isEditable ? "none" : "auto"}
      onSelectNode={selectData}
      menuProps={{
        canCopy: true,
        canCut: true,
        canDelete: true,
      }}
      menuItems={[
        <MenuItem onClick={convertNote}>Convert to document</MenuItem>,
      ]}
    >
      <EditorContent
        draggable={false}
        style={{
          padding: 0,
          margin: 0,
          width: "100%",
          height: "fit-content",
          overflow: "none",
          border: "none",
          pointerEvents: editor?.isEditable ? "unset" : "none",
        }}
        editor={editor}
      />
    </NodeWrapper>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const note = state.notes[id];
  return {
    pX: note.pX,
    pY: note.pY,
    sX: note.sX,
    sY: note.sY,
    content: note.content,
    parent: note.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Note);
