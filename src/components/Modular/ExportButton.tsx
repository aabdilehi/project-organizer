import { useRef } from "react";
import { useDispatch } from "react-redux";
import { importDataThunk, prepareDataThunk } from "../../utils/slices/thunks";
import React from "react";
import { EJSON } from "bson";

export const ImportButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const fr = useRef(new FileReader());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<any>();

  if (fr.current) {
    fr.current.onload = function () {
      if (this.result == null || typeof this.result != "string") return;
      if (fileInputRef.current) fileInputRef.current.value = "";
      dispatch(importDataThunk(EJSON.parse(this.result)));
    };
  }

  return (
    <button
      {...props}
      onClick={() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}
    >
      <input
        style={{
          display: "none",
        }}
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (!e.target.files || e.target.files.length <= 0) return;
          fr.current.readAsText(e.target.files[0]);
        }}
      />
      {children}
    </button>
  );
};

export const ExportButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const objectURL = useRef<string>();
  const dispatch = useDispatch<any>();

  return (
    <button
      {...props}
      onClick={() => {
        if (!anchorRef.current) return;
        const dataBlob = dispatch(prepareDataThunk());
        if (dataBlob) {
          if (objectURL.current) URL.revokeObjectURL(objectURL.current);
          objectURL.current = URL.createObjectURL(dataBlob);

          anchorRef.current.href = objectURL.current;
          anchorRef.current.click();
        }
      }}
    >
      <a
        style={{ display: "none" }}
        ref={anchorRef}
        href={objectURL.current}
        download={"state.json"}
      />
      {children}
    </button>
  );
};
