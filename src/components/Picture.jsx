import { useContext, useEffect, useRef, useState } from "react";
import ResizeObserver from "rc-resize-observer";
import React from "react";
import {
  Box,
  Card,
  Editable,
  IconButton,
  Image,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  useColorModeValue,
} from "@chakra-ui/react";
import { useClickAndHold } from "../utils/hooks/useClickAndHold";
import CustomEditablePreview from "./CustomEditablePreview";
import { AutoResizeEditableTextArea } from "./AutoResizeTextarea";
import { BoardObjects } from "../utils/enums/items";
import { SmallAddIcon } from "@chakra-ui/icons";
import { bindActionCreators } from "redux";
import {
  updateImage,
  updateLabel,
  updateLabelVisibility,
} from "../utils/slices/pictureSlice";
import { connect, useDispatch } from "react-redux";
import { useSmoothDrag } from "../utils/hooks/useSmoothDrag";
import {
  ContextMenuContext,
  useContextMenu,
} from "../utils/hooks/useContextMenu";
import {
  removeChild,
  removeNode,
  updateSize,
} from "../utils/slices/nodeActions";

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
  setContextMenu,
  openContextMenu,
  showLabel,
  updateLabel,
  updateLabelVisibility,
  updateImage,
}) => {
  const [labelHeight, setLabelHeight] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);

  const dragRef = useRef(null);
  const imageRef = useRef(null);
  const uploadRef = useRef(null);

  const [isInColumn, setIsInColumn] = useState(false);

  const dispatch = useDispatch();

  //#region Drag behaviour

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

  //#endregion

  // Read parent prop and set isInColumn
  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
      console.log(isInColumn);
    }
  }, [parent]);

  // Update total size using individual values
  useEffect(() => {
    if (!isInColumn && imageWidth !== 0 && imageHeight + labelHeight !== 0) {
      dispatch(
        updateSize.action({
          id,
          type: BoardObjects.IMAGE,
          sX: imageWidth,
          sY: imageHeight + labelHeight,
        })
      );
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
  };

  const deletePicture = () => {
    dispatch(removeChild.action({ id: parent.id, type: parent.type, cId: id }));
    dispatch(removeNode.action({ id, type: BoardObjects.IMAGE }));
  };

  const [imageMouseDownHandler, imageMouseUpHandler] = useClickAndHold(
    handleImageClick,
    handleImageHold,
    500
  );

  const { setMenuItems, copyNodes } = useContext(ContextMenuContext);

  const copyPicture = () => {
    const picture = {
      // new Id will be assigned
      type: BoardObjects.IMAGE,
      pX, // need position in case user uses keyboard shortcut
      pY,
      sX,
      sY,
      image,
      label,
      showLabel,
      // parent does not have to be the same
    };
    copyNodes([picture]);
  };

  const cutPicture = () => {
    copyPicture();
    deletePicture();
  };

  const updateContextMenu = () => {
    setMenuItems([
      <MenuItem onClick={cutPicture}>Cut</MenuItem>,
      <MenuItem onClick={copyPicture}>Copy</MenuItem>,
      <MenuItem onClick={deletePicture}>Delete</MenuItem>,
    ]);
  };

  // set label height to 0 if no label
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
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateContextMenu();
          openContextMenu(e);
        }}
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
        maxW={isInColumn ? undefined : "1000px"}
        minH={isInColumn ? undefined : sY + "px"}
        maxH={isInColumn ? undefined : sY + "px"}
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
                whiteSpace={"pre-wrap"}
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
    {
      updateImage,
      updateLabel,
      updateLabelVisibility,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Picture);
