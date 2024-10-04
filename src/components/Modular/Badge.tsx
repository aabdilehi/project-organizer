import React, { useState } from "react";
import CustomEditablePreview from "./CustomEditablePreview";
import { debounce } from "lodash";
import IconButton from "./IconButton";
import { TbX } from "react-icons/tb";
import "./Badge.css";

const previewStyle: React.CSSProperties = {
  width: "auto",
  fontWeight: "600",
  fontSize: "1em",
  borderRadius: "5px",
  boxSizing: "content-box",
  padding: "0px 2px",
  margin: 0,
};

export const BadgePreview = ({
  id,
  text,
  colour = "green",
}: {
  id: string;
  text: string;
  colour: "red" | "orange" | "green" | "blue";
}) => {
  return (
    <div
      id={id}
      key={id}
      style={{ overflowWrap: "anywhere" }}
      className={`badge ${colour}`}
    >
      {text}
    </div>
  );
};

export const BadgeEdit = ({
  id,
  text,
  colour: col = "green",
  onDelete,
  onChange,
}: {
  id: string;
  text: string;
  colour: "red" | "orange" | "green" | "blue";
  onDelete?: React.MouseEventHandler<HTMLButtonElement>;
  onChange?: (value: string) => void;
}) => {
  const [colour, setColour] = useState(col);

  return (
    <div
      id={`${id}-edit`}
      key={`${id}-edit`}
      className={`badge edit ${colour}`}
    >
      <button
        type="button"
        style={{
          borderRadius: "100%",
          width: "1.5em",
          height: "1.5em",
        }}
      >
        Col
      </button>
      <CustomEditablePreview
        canEdit={true}
        adjustSelf={true}
        text={text}
        onChange={onChange}
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
  );
};
