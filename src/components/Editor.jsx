import { Textarea } from "@chakra-ui/textarea";

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
import { IconButton } from "@chakra-ui/button";
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconBraces,
  IconClearFormatting,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconHighlight,
  IconItalic,
  IconLineDashed,
  IconList,
  IconListNumbers,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconTextColor,
  IconUnderline,
} from "@tabler/icons-react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Tooltip } from "@chakra-ui/tooltip";
import { useClickAndHold } from "../utils/hooks/useClickAndHold";
import { debounce } from "lodash";

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
  const [mouseDownHandler, mouseUpHandler] = useClickAndHold(
    highlightClickCallback,
    highlightHoldCallback
  );
  //#endregion
  return (
    <>
      <Tooltip openDelay={250} label="Undo">
        <IconButton
          aria-label="undo"
          icon={
            <IconArrowBackUp
              size={"18"}
              color={
                editor.isActive("undo")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedRight={"none"}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Redo">
        <IconButton
          aria-label="redo"
          icon={
            <IconArrowForwardUp
              size={"18"}
              color={
                editor.isActive("redo")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedLeft={"none"}
          mr={1}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Bold">
        <IconButton
          aria-label="bold"
          icon={
            <IconBold
              size={"18"}
              color={
                editor.isActive("bold")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedRight={"none"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          colorScheme={
            editor.isActive("bold")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("bold")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Italic">
        <IconButton
          aria-label="italic"
          icon={
            <IconItalic
              size={"18"}
              color={
                editor.isActive("italic")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          colorScheme={
            editor.isActive("italic")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("italic")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Strikethrough">
        <IconButton
          aria-label="strike"
          icon={
            <IconStrikethrough
              size={"18"}
              color={
                editor.isActive("strike")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          colorScheme={
            editor.isActive("strike")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("strike")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Underline">
        <IconButton
          aria-label="underline"
          icon={
            <IconUnderline
              size={"18"}
              color={
                editor.isActive("underline")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          colorScheme={
            editor.isActive("underline")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("underline")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <label
        style={{
          position: "relative",
        }}
        htmlFor="hidden-color-input"
      >
        <Tooltip openDelay={250} label="Text Colour">
          <IconButton
            aria-label="text-colour"
            icon={
              <IconTextColor
                size={"18"}
                color={
                  editor.getAttributes("textStyle").color
                    ? editor.getAttributes("textStyle").color
                    : useColorModeValue("black", "white")
                }
              />
            }
            size={"sm"}
            rounded={"none"}
            onClick={() => colourInputRef.current?.click()}
            colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
            backgroundColor={useColorModeValue("white", "blackAlpha.300")}
            color={editor.getAttributes("textStyle").color}
          />
        </Tooltip>
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
        <Tooltip
          openDelay={250}
          whiteSpace={"pre-line"}
          label={`Click to highlight.\nHold to choose colour.`}
        >
          <IconButton
            aria-label="highlight"
            icon={
              <IconHighlight
                size={"18"}
                color={
                  editor.isActive("highlight")
                    ? useColorModeValue("black", "white")
                    : highlightInputRef.current?.value
                }
              />
            }
            size={"sm"}
            rounded={"none"}
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            colorScheme={
              editor.isActive("highlight")
                ? "blue"
                : useColorModeValue("whiteAlpha", "blackAlpha")
            }
            backgroundColor={
              editor.isActive("highlight")
                ? highlightInputRef.current?.value
                : useColorModeValue("white", "blackAlpha.300")
            }
          />
        </Tooltip>
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
      <Tooltip openDelay={250} label="Clear formatting">
        <IconButton
          aria-label="clear-formatting"
          icon={
            <IconClearFormatting
              size={"18"}
              color={useColorModeValue("black", "white")}
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          disabled={!editor.can().chain().focus().unsetAllMarks().run()}
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Code">
        <IconButton
          aria-label="code"
          icon={
            <IconCode
              size={"18"}
              color={
                editor.isActive("code")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedLeft={"none"}
          mr={1}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          colorScheme={
            editor.isActive("code")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("code")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>

      <Tooltip openDelay={250} label="Heading 1">
        <IconButton
          aria-label="h1"
          icon={
            <IconH1
              size={"18"}
              color={
                editor.isActive("heading", { level: 1 })
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedRight={"none"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          colorScheme={
            editor.isActive("heading", { level: 1 })
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("heading", { level: 1 })
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Heading 2">
        <IconButton
          aria-label="h2"
          icon={
            <IconH2
              size={"18"}
              color={
                editor.isActive("heading", { level: 2 })
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          colorScheme={
            editor.isActive("heading", { level: 2 })
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("heading", { level: 2 })
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Heading 3">
        <IconButton
          aria-label="h3"
          icon={
            <IconH3
              size={"18"}
              color={
                editor.isActive("heading", { level: 3 })
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          colorScheme={
            editor.isActive("heading", { level: 3 })
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("heading", { level: 3 })
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Heading 4">
        <IconButton
          aria-label="h4"
          icon={
            <IconH4
              size={"18"}
              color={
                editor.isActive("heading", { level: 4 })
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          colorScheme={
            editor.isActive("heading", { level: 4 })
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("heading", { level: 4 })
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Superscript">
        <IconButton
          aria-label="superscript"
          icon={
            <IconSuperscript
              size={"18"}
              color={
                editor.isActive("superscript")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          colorScheme={
            editor.isActive("superscript")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("superscript")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Subscript">
        <IconButton
          aria-label="subscript"
          icon={
            <IconSubscript
              size={"18"}
              color={
                editor.isActive("subscript")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedLeft={"none"}
          mr={1}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          colorScheme={
            editor.isActive("subscript")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("subscript")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Block quote">
        <IconButton
          aria-label="blockquote"
          icon={
            <IconBlockquote
              size={"18"}
              color={
                editor.isActive("blockquote")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedRight={"none"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          colorScheme={
            editor.isActive("blockquote")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("blockquote")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Unordered list">
        <IconButton
          aria-label="bulletList"
          icon={
            <IconList
              size={"18"}
              color={
                editor.isActive("bulletList")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          colorScheme={
            editor.isActive("bulletList")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("bulletList")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Ordered list">
        <IconButton
          aria-label="orderedList"
          icon={
            <IconListNumbers
              size={"18"}
              color={
                editor.isActive("orderedList")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          colorScheme={
            editor.isActive("orderedList")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("orderedList")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Code block">
        <IconButton
          aria-label="codeBlock"
          icon={
            <IconBraces
              size={"18"}
              color={
                editor.isActive("codeBlock")
                  ? "currentColor"
                  : useColorModeValue("black", "white")
              }
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
          colorScheme={
            editor.isActive("codeBlock")
              ? "blue"
              : useColorModeValue("whiteAlpha", "blackAlpha")
          }
          backgroundColor={
            editor.isActive("codeBlock")
              ? undefined
              : useColorModeValue("white", "blackAlpha.300")
          }
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Horizontal Rule">
        <IconButton
          aria-label="horizontal-rule"
          icon={
            <IconLineDashed
              size={"18"}
              color={useColorModeValue("black", "white")}
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedLeft={"none"}
          mr={1}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Align Left">
        <IconButton
          aria-label="text-align-left"
          icon={
            <IconAlignLeft
              size={"18"}
              color={useColorModeValue("black", "white")}
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedRight={"none"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Align Center">
        <IconButton
          aria-label="text-align-center"
          icon={
            <IconAlignCenter
              size={"18"}
              color={useColorModeValue("black", "white")}
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Align Right">
        <IconButton
          aria-label="text-align-right"
          icon={
            <IconAlignRight
              size={"18"}
              color={useColorModeValue("black", "white")}
            />
          }
          size={"sm"}
          rounded={"none"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
      <Tooltip openDelay={250} label="Justify">
        <IconButton
          aria-label="stretch-text"
          icon={
            <IconAlignJustified
              size={"18"}
              color={useColorModeValue("black", "white")}
            />
          }
          size={"sm"}
          rounded={"sm"}
          roundedLeft={"none"}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" }) ? "is-active" : ""
          }
          colorScheme={useColorModeValue("whiteAlpha", "blackAlpha")}
          backgroundColor={useColorModeValue("white", "blackAlpha.300")}
        />
      </Tooltip>
    </>
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
