import React, { useState } from "react";
import CustomEditablePreview from "./CustomEditablePreview";
import IconButton from "./IconButton";
import { TbX } from "react-icons/tb";
import "./Badge.css";
import FloatingMenu from "./FloatingMenu";

const previewStyle: React.CSSProperties = {
  width: "fit-content",
  fontWeight: "600",
  fontSize: "1em",
  borderRadius: "5px",
  boxSizing: "content-box",
  padding: "0px",
  margin: 0,
};

const colors: ("red" | "orange" | "green" | "blue")[] = [
  "red",
  "orange",
  "green",
  "blue",
];
export const BadgePreview = ({
  id,
  text,
  colour,
}: {
  id: string;
  text: string;
  colour: (typeof colors)[number];
}) => {
  return (
    <div
      id={id}
      key={id}
      style={{
        overflowWrap: "anywhere",
        backgroundColor: `${colour} !important`,
      }}
      className={`badge ${colour}`}
    >
      {text}
    </div>
  );
};

export const BadgeEdit = ({
  id,
  text,
  colour = "green",
  onDelete,
  onValueChange,
  onColorChange,
}: {
  id: string;
  text: string;
  colour: "red" | "orange" | "green" | "blue";
  onDelete?: React.MouseEventHandler<HTMLButtonElement>;
  onValueChange: (value: string) => void;
  onColorChange: (value: string) => void;
}) => {
  const [colourPickerOpen, setColourPickerOpen] = useState<boolean>(false);

  return (
    <div 
        style={{ position: "relative" }}>
      <div
        id={`${id}-edit`}
        key={`${id}-edit`}
        className={`badge edit ${colour}`}
      >
        <button
          type="button"
          className={`badge ${colour}`}
          style={{
            borderRadius: "100%",
            width: "1.5em",
            height: "1.5em",
          }}
          onClick={() => setColourPickerOpen(true)}
        ></button>
        <CustomEditablePreview
          canEdit={true}
          adjustSelf={true}
          text={text}
          onChange={onValueChange}
          textStyle={previewStyle}
        />
        <IconButton
          icon={TbX}
          onClick={onDelete}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "100%",
            width: "1.5em",
            height: "1.5em",
          }}
        />
      </div>

      <FloatingMenu
        className="context-menu"
        open={colourPickerOpen}
        setOpen={setColourPickerOpen}
        style={{
          position: "absolute",
          transform: "translate(0%, 100%)",
          top: "5px",
          display: "flex",
          flexDirection: "row",
          gap: "5px",
          width: "fit-content",
          zIndex: 5,
        }}
      >
        {colors.map((color) => (
          <button
            type="button"
            className={`badge ${color}`}
            style={{
              borderRadius: "50%",
              width: "1.5em",
              height: "1.5em",
            }}
            onClick={() => {
              onColorChange(color as string);
              setColourPickerOpen(false);
            }}
          ></button>
        ))}
      </FloatingMenu>
    </div>
  );
};
