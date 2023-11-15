import {
  Box,
  Card,
  Icon,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import { SelectedNodeContext } from "../App";
import ResizeObserver from "rc-resize-observer";
import { BoardObjects } from "../utils/enums/items";
import { useClickAndHold } from "../utils/hooks/useClickandHold_selectNode";
import { useDispatch, useSelector } from "react-redux";
import {
  addSelectNode,
  selectNode,
  toggleSelectNode,
} from "../utils/slices/selectionSlice";
import { DragFunctions } from "./Board";
import { debounce } from "lodash";
import { IconRotate } from "@tabler/icons-react";

const rotateNode = (
  initialCoord = { x: 0, y: 0 },
  currentCoord = { x: 0, y: 0 }
) => {
  const deltaVector = {
    x: currentCoord.x - initialCoord.x,
    y: currentCoord.y - initialCoord.y,
  };
  // const upVector = { x: 0, y: 1 };

  // const dot = upVector.x * deltaVector.x + upVector.y * deltaVector.y; //ax · bx + ay · by
  // const upVectorMagnitude = Math.sqrt(
  //   Math.pow(upVector.x, 2) + Math.pow(upVector.y, 2)
  // );
  // const deltaVectorMagnitude = Math.sqrt(
  //   Math.pow(deltaVector.x, 2) + Math.pow(deltaVector.y, 2)
  // );

  // const angleBetweenVectors =
  //   (Math.acos(dot / (upVectorMagnitude * deltaVectorMagnitude)) * 180) /
  //     Math.PI -
  //   180;

  const angleBetweenVectors =
    (Math.atan2(deltaVector.y, deltaVector.x) * 180) / Math.PI + 90;
  return angleBetweenVectors;
};

const NodeWrapper = ({
  canPosition,
  canResize,
  animate,
  onResize = ({ width, height }) => {},
  menuProps,
  menuItems,
  clickCallback,
  holdCallback,
  openContextMenu,
  parent,
  pX,
  pY,
  isInColumn = false,
  style,
  ...props
}) => {
  const dragRef = useRef();

  const { handleDragStart, handleDrag, handleDragEnd } =
    useContext(DragFunctions);

  const selectedNodes = useSelector((state) => state.selection);
  const dispatch = useDispatch();

  const handleSelect = (e) => {
    console.log(selectedNodes);
    if (e.shiftKey) {
      dispatch(addSelectNode({ id: props.nodeId, type: props.nodeType }));
    } else if (e.ctrlKey) {
      dispatch(toggleSelectNode({ id: props.nodeId, type: props.nodeType }));
      return;
    } else {
      dispatch(selectNode({ id: props.nodeId, type: props.nodeType }));
      return;
    }
  };

  const [isSelected, setIsSelected] = useState(false);
  useEffect(() => {
    if (selectedNodes !== undefined) {
      setIsSelected(!!selectedNodes[props.nodeId]);
    }
  }, [selectedNodes]);

  //#region Context Menu
  const { setMenuItems, setMenuProps } = useContext(ContextMenuContext);

  const updateContextMenu = () => {
    setMenuItems(() => {
      return menuItems;
    });
    setMenuProps(() => {
      return menuProps;
    });
  };
  //#endregion

  const [mouseDownHandler, mouseUpHandler] = useClickAndHold(
    (e) => {
      if (!!dragRef.current) {
        handleSelect(e);
      }
    },
    isSelected,
    clickCallback,
    holdCallback
  );

  //#region Rotation stuff (WIP)
  const rotateRef = useRef(null);
  const [isRotating, setIsRotating] = useState(false);
  const shiftHeld = useRef(false);
  const currentAngle = useRef(0);
  let initialMouse = useRef({ x: 0, y: 0 });
  let currentMouse = useRef({ x: 0, y: 0 });
  const rotateMouseDown = (e) => {
    e.stopPropagation();
    setIsRotating(true);

    shiftHeld.current = e.shiftKey;
    currentMouse.current = { x: e.clientX, y: e.clientY };
    let bounds = dragRef.current.getBoundingClientRect();
    let width = bounds.right - bounds.left;
    let height = bounds.bottom - bounds.top;
    let center = { x: bounds.left + width / 2, y: bounds.top + height / 2 };
    initialMouse.current = { ...center };
  };

  const rotateMouseMove = (e) => {
    e.stopPropagation();
    currentMouse.current = { x: e.clientX, y: e.clientY };
    shiftHeld.current = e.shiftKey;
    if (e.shiftKey) {
      currentAngle.current =
        Math.round(
          rotateNode(initialMouse.current, currentMouse.current) / 45
        ) * 45;
    } else {
      currentAngle.current = rotateNode(
        initialMouse.current,
        currentMouse.current
      );
    }
  };

  const rotateMouseUp = (e) => {
    e.stopPropagation();
    setIsRotating(false);
    shiftHeld.current = false;
    initialMouse.current = { x: 0, y: 0 };
    currentMouse.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    if (isRotating) {
      window.addEventListener("mousemove", rotateMouseMove);
      window.addEventListener("mouseup", rotateMouseUp);
    } else {
      window.removeEventListener("mousemove", rotateMouseMove);
      window.removeEventListener("mouseup", rotateMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", rotateMouseMove);
      window.removeEventListener("mouseup", rotateMouseUp);
    };
  }, [isRotating, setIsRotating]);

  const animatethingy = () => {
    // console.log(currentAngle);
    if (rotateRef.current) {
      rotateRef.current.style.transform = isInColumn
        ? "translate(0px, 0px)"
        : `translate(${pX}px, ${pY}px)`;
      rotateRef.current.style.rotate = `${currentAngle.current}deg`;
    }
    // requestAnimationFrame(animatethingy);
  };
  // animatethingy();

  //#endregion

  const debouncedResize = debounce(onResize, 250);

  return (
    // resize breaks so easily so maybe do a custom solution for that or find something else
    // <Box
    //   ref={rotateRef}
    //   position={isInColumn ? "relative" : "absolute"}
    //   style={{
    //     transform: isInColumn
    //       ? "translate(0px, 0px)"
    //       : `translate(${pX}px, ${pY}px) rotate(${currentAngle.current}deg)`,
    //     transition: "none",
    //     transformOrigin: "center",
    //   }}
    // >
    //   <IconRotate
    //     style={{
    //       position: "relative",
    //       top: "-25px",
    //       padding: "0px",
    //       margin: "0px",
    //       zIndex: 1000,
    //       overflow: "visible",
    //     }}
    //     onMouseDown={rotateMouseDown}
    //   />
    <Card
      ref={dragRef}
      position={isInColumn ? "relative" : "absolute"}
      resize={canResize ? "both" : "none"}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      draggable={canPosition}
      bg={props.bg ? props.bg : useColorModeValue("gray.400", "gray.800")}
      outline={
        props.outline ? props.outline : isSelected ? "3px solid" : "1px solid"
      }
      outlineColor={useColorModeValue("blackAlpha.500", "whiteAlpha.300")}
      color={useColorModeValue("black", "white")}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        updateContextMenu();
        openContextMenu(e);
      }}
      style={{
        transform: isInColumn
          ? "translate(0px, 0px)"
          : `translate(${pX}px, ${pY}px)`,
        ...style,
        position: isInColumn ? "relative" : "absolute",
        overflow: "visible",
      }}
      {...props}
    >
      {props.children}
    </Card>
    // </Box>
  );
};

export default NodeWrapper;
