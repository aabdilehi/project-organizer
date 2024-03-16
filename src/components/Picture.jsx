import { useContext, useEffect, useMemo, useRef, useState } from "react";
import ResizeObserver from "rc-resize-observer";
import React from "react";
import {
  Box,
  Card,
  Editable,
  IconButton,
  Image,
  MenuItem,
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
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import {
  removeChild,
  removeNode,
  updateSize,
} from "../utils/slices/nodeActions";
import NodeWrapper from "./NodeWrapper";

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
  handleDragStart,
  handleDrag,
  handleDragEnd,
  animate,
}) => {
  const [labelHeight, setLabelHeight] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);

  const dragRef = useRef(null);
  const imageRef = useRef(null);
  const uploadRef = useRef(null);

  const [isInColumn, setIsInColumn] = useState(false);

  const dispatch = useDispatch();

  // Determines sizing and positioning based on whether in column or not
  useEffect(() => {
    if (parent !== undefined) {
      setIsInColumn(parent.type === BoardObjects.COLUMN);
    }
  }, [parent]);

  //#endregion

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

  // set label height to 0 if no label
  useEffect(() => {
    if (!showLabel) {
      setLabelHeight(0);
    }
  }, [showLabel]);
  /*
    
    if (event.button === 0) {
      uploadRef.current.click();
    }
    onResize={({ width }) => {
        //updateSize(id, width, height);
        if (!isInColumn && imageWidth !== width / scale) {
          setImageWidth(width / scale);
        }
      }}
  */

  const selectData = useMemo(() => {
    return {
      id, // new Id will be assigned
      type: BoardObjects.IMAGE,
      pX, // need position in case user uses keyboard shortcut
      pY,
      sX,
      sY,
      label,
      image,
      parent,
    };
  }, [id, pX, pY, sX, sY, label, image, parent]);

  return (
    <NodeWrapper
      nodeId={id}
      pX={pX}
      pY={pY}
      canPosition={true}
      canResize={true}
      onSelectNode={selectData}
      isInColumn={isInColumn}
      onResize={({ width }) => {
        //updateSize(id, width, height);
        if (!isInColumn && imageWidth !== width / scale) {
          setImageWidth(width / scale);
        }
      }}
      clickCallback={(e) => {
        if (e.button === 0) {
          uploadRef.current.click();
        }
      }}
      holdCallback={() => {}}
      menuProps={{
        canCopy: true,
        canCut: true,
        canDelete: true,
      }}
      menuItems={[]}
      animate={animate}
      handleDragStart={handleDragStart}
      handleDrag={handleDrag}
      handleDragEnd={handleDragEnd}
      openContextMenu={openContextMenu}
      bgColor="gray.800"
      overflow={"hidden"}
      resize={"horizontal"}
      p={0}
      rounded="sm"
      h="fit-content"
      maxW={isInColumn ? undefined : "1000px"}
      minH={isInColumn ? undefined : Math.min(100, sY) + "px"}
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
        <span position="relative" draggable={false} ref={imageRef}>
          <Image
            draggable={false}
            objectFit={"cover"}
            w="100%"
            cursor="pointer"
            fallbackSrc={"https://via.placeholder.com/" + sX}
            src={image}
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
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                updateLabelVisibility({ pictureId: id, showLabel: true });
              }}
            />
          ) : (
            ""
          )}
        </span>
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
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
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
    </NodeWrapper>
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
