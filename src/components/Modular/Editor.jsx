import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import ListItem from "@tiptap/extension-list-item";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";

import React, { useRef } from "react";
import {
  TbAlignCenter as IconAlignCenter,
  TbAlignJustified as IconAlignJustified,
  TbAlignLeft as IconAlignLeft,
  TbAlignRight as IconAlignRight,
  TbArrowBackUp as IconArrowBackUp,
  TbArrowForwardUp as IconArrowForwardUp,
  TbBlockquote as IconBlockquote,
  TbBold as IconBold,
  TbBraces as IconBraces,
  TbClearFormatting as IconClearFormatting,
  TbCode as IconCode,
  TbH1 as IconH1,
  TbH2 as IconH2,
  TbH3 as IconH3,
  TbH4 as IconH4,
  TbHighlight as IconHighlight,
  TbItalic as IconItalic,
  TbLineDashed as IconLineDashed,
  TbList as IconList,
  TbListNumbers as IconListNumbers,
  TbStrikethrough as IconStrikethrough,
  TbSubscript as IconSubscript,
  TbSuperscript as IconSuperscript,
  TbTextColor as IconTextColor,
  TbUnderline as IconUnderline,
} from "react-icons/tb";
import { debounce } from "lodash";
import { EditorButton } from "./EditorButton";

export const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }
  //#region Text and highlight colour behaviour
  const colourInputRef = useRef();
  const highlightInputRef = useRef();

  const handleTextColour = debounce((value) => {
    editor.chain().focus().setColor(value).run();
  }, 500);

  const handleHighlightColour = debounce((value) => {
    editor.chain().focus().setHighlight({ color: value }).run();
  }, 500);

  const highlightClickCallback = () => {
    // Toggle highlight on selected using current highlight colour
    editor
      .chain()
      .focus()
      .toggleHighlight({ color: highlightInputRef.current?.value })
      .run();
  };
  const highlightHoldCallback = () => {
    // Open color input using its click function
    highlightInputRef.current?.click();
  };

  const timeOutRef = useRef(null);

  const mouseDown = (event) => {
    timeOutRef.current = setTimeout(() => {
      // Execute hold as 400ms have passed
      highlightHoldCallback();

      // Clean up for next time
      clearTimeout(timeOutRef.current);
      timeOutRef.current = null;
    }, 400);
  };

  const mouseUp = (event) => {
    if (timeOutRef.current) {
      // Execute click as timeout still running
      highlightClickCallback();

      // Clean up for next time
      clearTimeout(timeOutRef.current);
      timeOutRef.current = null;
    }
  };
  //#endregion
  return (
    <div className="editor-toolbar">
      <div className="editor-button-group">
        <EditorButton
          label="Undo"
          icon={IconArrowBackUp}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        />
        <EditorButton
          label="Redo"
          icon={IconArrowForwardUp}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        />
      </div>
      <div className="editor-button-group">
        <EditorButton
          label={"Bold"}
          icon={IconBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        />
        <EditorButton
          label="Italic"
          icon={IconItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        />
        <EditorButton
          label="Strikethrough"
          icon={IconStrikethrough}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        />
        <EditorButton
          label="Underline"
          icon={IconUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        />
        <label
          style={{
            position: "relative",
          }}
          htmlFor="hidden-color-input"
        >
          <EditorButton
            label="Text Colour"
            icon={IconTextColor}
            iconColor={
              editor.getAttributes("textStyle").color
                ? editor.getAttributes("textStyle").color
                : undefined
            }
            onClick={() => colourInputRef.current?.click()}
          />
          <input
            id="hidden-color-input"
            name="hidden-color-input"
            style={{
              position: "absolute",
              opacity: 0,
              left: "-3px",
              top: "30px",
              padding: 0,
              margin: 0,
              width: 0,
              height: 0,
            }}
            ref={colourInputRef}
            type="color"
            onChange={(event) => {
              // @ts-ignore
              handleTextColour(event.target.value);
            }}
            value={editor.getAttributes("textStyle").color}
          />
        </label>

        <label
          style={{
            position: "relative",
          }}
          htmlFor="hidden-highlight-input"
        >
          <EditorButton
            label={`Click to highlight.\nHold to choose colour.`}
            icon={IconHighlight}
            ariaLabel="highlight"
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
            iconColor={
              editor.isActive("highlight")
                ? undefined
                : highlightInputRef.current?.value
            }
            backgroundColor={
              editor.isActive("highlight")
                ? highlightInputRef.current?.value
                : undefined
            }
          />
          <input
            name="hidden-highlight-input"
            style={{
              position: "absolute",
              opacity: 0,
              left: "-3px",
              top: "30px",
              padding: 0,
              margin: 0,
              width: 0,
              height: 0,
            }}
            ref={highlightInputRef}
            type="color"
            onChange={(event) => {
              handleHighlightColour(event.target.value);
            }}
            defaultValue={"#ffe066"}
          />
        </label>
        <EditorButton
          label="Clear formatting"
          icon={IconClearFormatting}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          disabled={!editor.can().chain().focus().unsetAllMarks().run()}
        />
        <EditorButton
          label="Code"
          icon={IconCode}
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          disabled={!editor.can().chain().focus().toggleCode().run()}
        />
      </div>
      <div className="editor-button-group">
        <EditorButton
          label="Heading 1"
          icon={IconH1}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
        />
        <EditorButton
          label="Heading 2"
          icon={IconH2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        />
        <EditorButton
          label="Heading 3"
          icon={IconH3}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        />
        <EditorButton
          label="Heading 4"
          icon={IconH4}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          active={editor.isActive("heading", { level: 4 })}
        />
        <EditorButton
          label="Superscript"
          icon={IconSuperscript}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive("superscript")}
        />
        <EditorButton
          label="Subscript"
          icon={IconSubscript}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive("subscript")}
        />
      </div>
      <div className="editor-button-group">
        <EditorButton
          label="Blockquote"
          icon={IconBlockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        />

        <EditorButton
          label="Unordered list"
          icon={IconList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        />

        <EditorButton
          label="Ordered list"
          icon={IconListNumbers}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        />

        <EditorButton
          label="Code block"
          icon={IconBraces}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        />

        <EditorButton
          label="Horizontal rule"
          icon={IconLineDashed}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>
      <div className="editor-button-group">
        <EditorButton
          label="Text align left"
          icon={IconAlignLeft}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        />
        <EditorButton
          label="Text align center"
          icon={IconAlignCenter}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        />
        <EditorButton
          label="Text align right"
          icon={IconAlignRight}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        />
        <EditorButton
          label="Text align justify"
          icon={IconAlignJustified}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
        />
      </div>
    </div>
  );
};

export const Editor = () => {
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
    content: `
            <h2>
              Hi there,
            </h2>
            <p>
              this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
            </p>
            <ul>
              <li>
                That’s a bullet list with one …
              </li>
              <li>
                … or two list items.
              </li>
            </ul>
            <p>
              Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
            </p>
            <pre><code class="language-css">body {
        display: none;
      }</code></pre>
            <p>
              I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
            </p>
            <blockquote>
              Wow, that’s amazing. Good work, boy! 👏
              <br />
              — Mom
            </blockquote>
          `,
  });

  return (
    <Textarea
      rounded={"sm"}
      roundedTop={"none"}
      h={"fit-content"}
      minH={"100%"}
      p={0}
      m={0}
      as={EditorContent}
      backgroundColor={useColorModeValue("whiteAlpha.200", "blackAlpha.200")}
      border={"none"}
      editor={editor}
    />
  );
};
