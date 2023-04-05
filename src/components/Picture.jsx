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
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { useClickAndHold } from "../hooks/useClickAndHold";
import CustomEditablePreview from "./CustomEditablePreview";
import { AutoResizeEditableTextArea } from "./AutoResizeTextarea";
import { useDrag } from "react-dnd";
import { BoardObjects } from "../enums/items";
import Board from "./Board";
import { AddIcon, SmallAddIcon } from "@chakra-ui/icons";
import { bindActionCreators } from "redux";
import { useResizeDetector } from "react-resize-detector";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from "@cloudinary/url-gen";
import {
  updateImage,
  updateSize,
  updateLabel,
  updateLabelVisibility,
} from "../slices/pictureSlice";
import { connect } from "react-redux";
import { useSmoothDrag } from "../hooks/useSmoothDrag";
import { AdvancedImage } from "@cloudinary/react";

// Important thing is to keep the aspect ratio of the image
// Aspect ratio is width to height but the numbers are unpredictable
// K
// UpdateWidth which sets the height to be width/ratio, e.g. 2:1,

const Picture = ({
  boardId,
  boardRef,
  id,
  offset,
  scale,
  image,
  pX,
  pY,
  sX,
  sY,
  label,
  parent,
  showLabel,
  updateLabel,
  updateLabelVisibility,
  updateImage,
  updateSize,
}) => {
  const [labelHeight, setLabelHeight] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);

  const dragRef = useRef(null);
  const imageRef = useRef(null);
  const uploadRef = useRef(null);

  const [isInColumn, setIsInColumn] = useState(false);

  const item = {
    id: id,
    type: BoardObjects.IMAGE,
    parent: parent,
  };
  const { handleDragStart, handleDrag, handleDragEnd, animate } = useSmoothDrag(
    {
      boardId,
      boardRef,
      elementRef: dragRef,
      initialCoords: { x: pX, y: pY },
      shouldAnimate: true,
      shouldPosition: !isInColumn,
      item,
      offset,
      scale,
    }
  );

  animate();

  // Read parent prop and set isInColumn
  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
      console.log(isInColumn);
    }
  }, [parent]);

  useEffect(() => {
    if (!isInColumn && imageWidth !== 0 && imageHeight + labelHeight !== 0) {
      //console.log(`Width: ${imageWidth}\nHeight: ${imageHeight + labelHeight}`);
      updateSize({
        pictureId: id,
        sX: imageWidth,
        sY: imageHeight + labelHeight,
      });
    }
  }, [imageHeight, imageWidth, labelHeight, isInColumn]);

  const handleImageClick = (event) => {
    // For uploading image
    if (event.button === 0) {
      uploadRef.current.click();
    }
    console.log("Click");
  };

  const handleImageHold = () => {
    // Do nothing here
    console.log("Hold");
  };

  const [imageMouseDownHandler, imageMouseUpHandler] = useClickAndHold(
    handleImageClick,
    handleImageHold,
    500
  );

  useEffect(() => {
    if (!showLabel) {
      setLabelHeight(0);
    }
  }, [showLabel]);

  return (
    <ResizeObserver
      onResize={({ width }) => {
        //updateSize(id, width, height);
        if (!isInColumn && imageWidth !== width / scale) {
          setImageWidth(width / scale);
        }
      }}
    >
      <Card
        ref={dragRef}
        draggable={true}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        bgColor="gray.800"
        direction={"column"}
        outline="1px solid"
        outlineColor={useColorModeValue("blackAlpha.300", "whiteAlpha.300")}
        overflow={"hidden"}
        resize={"both"}
        position={isInColumn ? "relative" : "absolute"}
        p={0}
        rounded="sm"
        h={isInColumn ? "auto" : sY + "px"}
        maxW={isInColumn ? undefined : `min(${sX}px, 3000px)`}
        minH={isInColumn ? undefined : sY + "px"}
        maxH={isInColumn ? undefined : `min(${sY}px, 2000px)`}
        w={isInColumn ? undefined : sX + "px"}
        style={{
          minWidth: isInColumn ? "100%" : "100px",
        }}
        zIndex={2}
      >
        <label style={{ display: "none" }} htmlFor="blang">
          <input
            ref={uploadRef}
            draggable={false}
            type="file"
            name="blang"
            onChange={(e) => {
              const url = URL.createObjectURL(e.target.files[0]);
              updateImage({
                pictureId: id,
                image: url,
              });
            }}
          />
        </label>
        <ResizeObserver
          onResize={({ height }) => {
            if (!isInColumn && imageHeight !== height / scale) {
              setImageHeight(height / scale);
            }
          }}
        >
          <Box position="relative" draggable={false} ref={imageRef}>
            <Image
              draggable={false}
              objectFit={"cover"}
              w="100%"
              cursor="pointer"
              fallbackSrc={"https://via.placeholder.com/" + sX}
              src={image}
              onMouseDown={imageMouseDownHandler}
              onMouseUp={imageMouseUpHandler}
            ></Image>
            {!showLabel ? (
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
                onClick={() =>
                  updateLabelVisibility({ pictureId: id, showLabel: true })
                }
              />
            ) : (
              ""
            )}
          </Box>
        </ResizeObserver>

        {showLabel ? (
          <ResizeObserver
            onResize={({ height }) => {
              if (!isInColumn && labelHeight !== height / scale) {
                setLabelHeight(height / scale);
              }
            }}
          >
            <Editable
              w="full"
              p={2}
              isPreviewFocusable={false}
              wordBreak="break-all"
              value={label}
              submitOnBlur={true}
              onChange={(value) => {
                updateLabel({ pictureId: id, label: value });
              }}
              onSubmit={(value) => {
                if (value === "") {
                  updateLabelVisibility({ pictureId: id, showLabel: false });
                }
              }}
              placeholder="Label"
              bg={useColorModeValue("gray.400", "gray.800")}
              color={useColorModeValue("black", "white")}
            >
              <CustomEditablePreview
                color={useColorModeValue("black", "white")}
                w="full"
              />
              <AutoResizeEditableTextArea />
            </Editable>
          </ResizeObserver>
        ) : null}
      </Card>
    </ResizeObserver>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const picture = state.pictures[id];
  return {
    image: picture.image,
    label: picture.label,
    showLabel: picture.showLabel,
    pX: picture.pX,
    pY: picture.pY,
    sX: picture.sX,
    sY: picture.sY,
    parent: picture.parent,
    type: picture.type,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { updateImage, updateLabel, updateSize, updateLabelVisibility },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Picture);
