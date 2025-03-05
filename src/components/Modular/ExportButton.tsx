import { createSelector } from "@reduxjs/toolkit";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { importDataThunk, prepareDataThunk } from "../../utils/slices/thunks";
import React from "react";

export const ImportButton = ({
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const fr = useRef(new FileReader());
  const buttonRef = useRef();
  const dispatch = useDispatch();

  if (fr.current) {
    fr.current.onload = function () {
      buttonRef.current.value = "";
      //   console.log(JSON.parse(fr.current.result));
      dispatch(importDataThunk(JSON.parse(fr.current.result)));
    };
  }

  return (
    <button
      {...props}
      onClick={() => {
        if (buttonRef.current) {
          buttonRef.current.click();
        }
      }}
    >
      <input
        style={{
          display: "none",
        }}
        type="file"
        ref={buttonRef}
        onChange={(e) => {
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
  const buttonRef = useRef();
  const objectURL = useRef();
  const dispatch = useDispatch();

  return (
    <button
      {...props}
      onClick={() => {
        if (!buttonRef.current) return;
        const dataBlob = dispatch(prepareDataThunk());
        if (dataBlob) {
          URL.revokeObjectURL(objectURL.current);
          objectURL.current = URL.createObjectURL(dataBlob);
        }
        buttonRef.current.href = objectURL.current;
        buttonRef.current.click();
      }}
    >
      <a
        style={{ display: "none" }}
        ref={buttonRef}
        href={objectURL.current}
        download={"state.json"}
      />
      {children}
    </button>
  );
};
