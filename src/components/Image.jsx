/** @jsxImportSource @emotion/react */
import "../App.css";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { BoardObjects } from "../utils/enums/items.tsx";
import IconButton from "./Modular/IconButton.tsx";
import { TbCheck, TbEdit, TbX } from "react-icons/tb";
import { Modal } from "./Modular/Modal.tsx";
import { updateImage } from "../utils/slices/imageSlice.ts";
import { Binary, EJSON } from "bson";
import { addImageThunk } from "../utils/slices/thunks.ts";

const Image = ({ id, onContextMenu, offset, scale }) => {
  const nodeRef = useRef();
  const fileUploadRef = useRef();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const { pX, pY, sX, sY, imageId, parent } = useSelector(
    (state) => state.images[id]
  );

  const image = useSelector((state) => state.imageMap[imageId] ?? "");

  const [tempImage, setTempImage] = useState(image);
  const [tempImageUrl, setTempImageUrl] = useState("");

  const getFileFromInput = () => {
    return new Promise((resolve, reject) => {
      if (!fileUploadRef.current) {
        reject("File input ref not assigned.");
        return;
      }
      const file = fileUploadRef.current.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!fileUploadRef.current) {
          reject("File input ref not assigned.");
          return;
        }
        fileUploadRef.current.value = "";
        resolve({
          ["fileName"]: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result,
        });
      };
      reader.onerror = (event) => {
        reject(event.target?.error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <>
      <NodeWrapper
        ref={nodeRef}
        id={id}
        type={BoardObjects.IMAGE}
        canPosition={true}
        canResize={true}
        pX={pX}
        pY={pY}
        sX={sX ?? 200}
        sY={sY}
        parentId={parent.id}
        parentType={parent.type}
        scale={scale}
        offset={offset}
        onContextMenu={onContextMenu}
      >
        <img
          src={image}
          style={{
            width: "100%",
            pointerEvents: "none",
          }}
        />
        <IconButton
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "25px",
            width: "25px",
            borderRadius: "6px",
            alignItems: "center",
            justifyContent: "center",
          }}
          icon={TbEdit}
          onClick={() => {
            setOpen(true);
          }}
        />
      </NodeWrapper>
      <Modal open={open} setOpen={setOpen}>
        <p>File thingy goes here</p>
        <img src={tempImageUrl} />
        <input
          type="file"
          ref={fileUploadRef}
          onChange={async (e) => {
            e.preventDefault();

            // Read image file
            const file = await getFileFromInput();

            // Clean up previous image
            URL.revokeObjectURL(tempImageUrl);

            // Set new image
            const blob = new Blob([file.data]);
            setTempImage(file.data);
            setTempImageUrl(URL.createObjectURL(blob));
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "right",
          }}
        >
          <button
            type="button"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "0.375rem",
            }}
            onClick={() => {
              if (tempImage) {
                // Convert temp image to binary
                const uint8Array = new Uint8Array(tempImage);

                // Clean up temp image
                URL.revokeObjectURL(tempImageUrl);
                setTempImage(image);

                // Add image to state
                dispatch(addImageThunk(id, new Binary(uint8Array)));
              }
              setOpen(false);
            }}
          >
            <TbCheck size={24} />
          </button>
          <button
            type="button"
            style={{
              appearance: "none",
              width: "40px",
              height: "40px",
              borderRadius: "0.375rem",
            }}
            onClick={() => {
              setTempImage(image);
              setOpen(false);
            }}
          >
            <TbX size={24} />
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Image;
