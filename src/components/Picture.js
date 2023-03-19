import { useEffect, useRef, useState } from "react";
import ResizeObserver from "rc-resize-observer";
import React from "react";
import {
  Box,
  Card,
  CardFooter,
  Editable,
  IconButton,
  Image,
  Input,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { useClickAndHold } from "../hooks/useClickAndHold";
import CustomEditablePreview from "./CustomEditablePreview";
import { AutoResizeEditableTextArea } from "./AutoResizeTextarea";
import { useDrag } from "react-dnd";
import { BoardObjects } from "../enums/items";
import Board from "./Board";
import { AddIcon, SmallAddIcon } from "@chakra-ui/icons";

// Important thing is to keep the aspect ratio of the image
// Aspect ratio is width to height but the numbers are unpredictable
// K
// UpdateWidth which sets the height to be width/ratio, e.g. 2:1,

const Picture = ({
  id,
  image,
  pX,
  pY,
  sX,
  sY,
  text,
  parent,
  updateSize,
  updateContent,
  updateImage,
}) => {
  const [imageSrc, setImageSrc] = useState(image);
  const [hasLabel, setHasLabel] = useState(false);

  const [labelHeight, setLabelHeight] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);

  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const uploadRef = useRef(null);
  const labelRef = useRef(null);

  const [isInColumn, setIsInColumn] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: BoardObjects.IMAGE,
    item: { id: id, type: BoardObjects.IMAGE, ref: cardRef, parent: parent },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));
  drag(cardRef);

  // Read parent prop and set isInColumn
  useEffect(() => {
    setIsInColumn(parent.type === BoardObjects.COLUMN);
    console.log(isInColumn);
  }, [parent]);

  useEffect(() => {
    if (!isInColumn && imageWidth !== 0 && imageHeight + labelHeight !== 0) {
      //console.log(`Width: ${imageWidth}\nHeight: ${imageHeight + labelHeight}`);
      updateSize(id, imageWidth, imageHeight + labelHeight);
    }
  }, [imageHeight, imageWidth, labelHeight, isInColumn]);

  const handleImageClick = () => {
    // For uploading image

    uploadRef.current.click();
    console.log("Click");
  };

  const handleImageHold = () => {
    // Do nothing here
    console.log("Hold");
  };

  useEffect(() => {}, [text]);

  const [imageMouseDownHandler, imageMouseUpHandler] = useClickAndHold(
    handleImageClick,
    handleImageHold,
    500
  );

  return (
    <ResizeObserver
      onResize={({ width, height }) => {
        //updateSize(id, width, height);
        if (!isInColumn) {
          setImageWidth(width);
        }
      }}
    >
      <Card
        ref={cardRef}
        bgColor="gray.800"
        direction={"column"}
        resize={isInColumn ? "none" : "both"}
        overflow={"hidden"}
        position={isInColumn ? "static" : "absolute"}
        p={0}
        rounded="none"
        h={isInColumn ? "auto" : undefined}
        minH={isInColumn ? undefined : sY + "px"}
        maxH={isInColumn ? undefined : sY + "px"}
        w={isInColumn ? undefined : sX + "px"}
        style={{
          minWidth: isInColumn ? "100%" : "100px",
          left: isInColumn ? undefined : pX + "px",
          top: isInColumn ? undefined : pY + "px",
        }}
      >
        <label style={{ display: "none" }} htmlFor="blang">
          <input
            ref={uploadRef}
            type="file"
            name="blang"
            onChange={(e) => {
              updateImage(id, URL.createObjectURL(e.target.files[0]));
            }}
          />
        </label>
        <ResizeObserver
          onResize={({ width, height }) => {
            if (!isInColumn) {
              setImageHeight(height);
            }
          }}
        >
          <Box position="relative" ref={imageRef}>
            <Tooltip label="Click to upload image">
              <Image
                objectFit={"cover"}
                w="100%"
                cursor="pointer"
                fallbackSrc={"https://via.placeholder.com/" + 200}
                src={image}
                onMouseDown={imageMouseDownHandler}
                onMouseUp={imageMouseUpHandler}
              ></Image>
            </Tooltip>
            {!hasLabel ? (
              <IconButton
                position="absolute"
                bgColor={"gray.700"}
                opacity={0.65}
                _hover={{ bgColor: "gray.600", opacity: 1 }}
                bottom={2}
                right={2}
                variant="outline"
                aria-label="add-label"
                icon={<SmallAddIcon />}
                onClick={() => setHasLabel(true)}
              />
            ) : (
              ""
            )}
          </Box>
        </ResizeObserver>

        <ResizeObserver
          onResize={({ width, height }) => {
            if (!isInColumn) {
              setLabelHeight(height);
            }
          }}
        >
          {!hasLabel ? (
            ""
          ) : (
            <Editable
              w="full"
              p={2}
              isPreviewFocusable={false}
              wordBreak="break-all"
              defaultValue={text}
              submitOnBlur={true}
              onSubmit={(value) => {
                updateContent(id, value);
              }}
              placeholder="Label"
            >
              <CustomEditablePreview w="full" />
              <AutoResizeEditableTextArea />
            </Editable>
          )}
        </ResizeObserver>
      </Card>
    </ResizeObserver>
  );
};

export default Picture;
