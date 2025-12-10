/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent, useEditor } from "@tiptap/react";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useNavigate } from "react-router-dom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import {
  updateContent,
  updateSize,
  updateTitle,
} from "../utils/slices/nodeActions.ts";
import { Modal } from "./Modular/Modal";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { TbFileText } from "react-icons/tb";
import { MenuBar } from "./Modular/Editor.jsx";
import _, { debounce } from "lodash";

const updateDocContent = (dispatch, id, editor) => {
  dispatch(
    updateContent.action({
      id,
      type: BoardObjects.NOTE,
      content: editor.getHTML(),
    })
  );
  let { from, to } = editor.state.selection;
  editor.commands.setTextSelection({ from, to });
};

const debouncedUpdate = debounce(updateDocContent, 250, { maxWait: 1000 });

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};

const Document = ({ id, onContextMenu, scale, offset }) => {
  const dispatch = useDispatch();
  const document = useSelector((state) => state.documents[id]);

  if (!document) return;
  const { pX, pY, sX, sY, title, content, parent } = document;

  const [open, setOpen] = useState(false);
  const nodeRef = useRef();

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name] }),
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
    onUpdate: ({ editor }) => debouncedUpdate(dispatch, id, editor),
  });

  const updateSizeFromElement = () =>{
      if (nodeRef.current != null) {
        nodeRef.current.style.height = "unset";
        const bounds = nodeRef.current.getBoundingClientRect();
        if (
          Math.abs(sY - bounds.height / scale) > 10 // Padding is 10 on each side
        ) {
          dispatch(
            updateSize.action({
              id,
              type: BoardObjects.DOCUMENT,
              sX: bounds.width / scale,
              sY: bounds.height / scale,
            })
          );
        }
        nodeRef.current.style.height = sY;
      }
    };

  // updateSizeFromElement();

  return (
    <>
      <NodeWrapper
        ref={nodeRef}
        id={id}
        type={BoardObjects.DOCUMENT}
        canPosition={true}
        canResize={false}
        pX={pX}
        pY={pY}
        sX={sX}
        sY={sY}
        parentId={parent.id}
        parentType={parent.type}
        onContextMenu={onContextMenu}
      >
        <div className="icon-wrapper" onDoubleClick={() => setOpen(true)}>
          <TbFileText pointerEvents={"none"} />
        </div>
        <CustomEditablePreview
          as={"p"}
          canEdit={true}
          text={title}
          textStyle={previewStyle}
          changeOnSubmit
          onChange={(value) =>
            dispatch(
              updateTitle.action({
                id,
                type: BoardObjects.DOCUMENT,
                title: value,
              })
            )
          }
          onImmediateChange={updateSizeFromElement}
        />
      </NodeWrapper>
      <Modal
        open={open}
        setOpen={(boolean) => setOpen(boolean)}
        modalStyle={{ padding: "55px 0", boxSizing: "border-box" }}
      >
        <MenuBar editor={editor} />
        <EditorContent
          style={{
            height: "100%",
            padding: 0,
            margin: 0,
            border: "none",
            outline: "none",
          }}
          editor={editor}
        />
      </Modal>
    </>
  );
};
export default Document;
