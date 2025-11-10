import "../App.css";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper";
import { BoardObjects } from "../utils/enums/items";
import IconButton from "./Modular/IconButton";
import { TbCheck, TbEdit, TbX } from "react-icons/tb";
import { Modal } from "./Modular/Modal";
import { Binary } from "bson";
import { addImageThunk } from "../utils/slices/thunks";
import React from "react";
import { RootState } from "../store";
import { PlainRootState } from "../utils/slices/types";

type ImageData = {
  name: string;
  type: string;
  size: number;
  data?: ArrayBuffer | string | null;
};

const Image = ({
  id,
  onContextMenu,
}: {
  id: string;
  onContextMenu: (event: any) => void;
}) => {
  const nodeRef = useRef();
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<any>();
  const [open, setOpen] = useState(false);

  const { pX, pY, sX, sY, imageId, parent } = useSelector(
    (state: PlainRootState) => state.images[id]
  );
  const image = useSelector((state: PlainRootState) =>
    imageId ? state.imageMap[imageId] : ""
  );

  const [tempImage, setTempImage] = useState<string | ArrayBuffer>(image);
  const [tempImageUrl, setTempImageUrl] = useState("");

  const getFileFromInput: () => Promise<ImageData> = () => {
    return new Promise((resolve, reject) => {
      if (!fileUploadRef.current) {
        reject("File input ref not assigned.");
        return;
      }
      if (
        !fileUploadRef.current.files ||
        fileUploadRef.current.files?.length <= 0
      )
        return;
      const file = fileUploadRef.current.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!fileUploadRef.current) {
          reject("File input ref not assigned.");
          return;
        }
        fileUploadRef.current.value = "";
        resolve({
          name: file.name,
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
        sX={sX}
        sY={sY}
        parentId={parent.id}
        parentType={parent.type}
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
            const blob = new Blob([file.data!]);
            setTempImage(file.data!);
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
                if (typeof tempImage == "string") return;
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
