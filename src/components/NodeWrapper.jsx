import { Card, useColorModeValue } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import { SelectedNodeContext } from "../App";
import ResizeObserver from "rc-resize-observer";
import { BoardObjects } from "../utils/enums/items";
import { useClickAndHold } from "../utils/hooks/useClickandHold_selectNode";

const NodeWrapper = ({
  canPosition,
  canResize,
  handleDragStart,
  handleDragEnd,
  handleDrag,
  animate,
  menuProps,
  menuItems,
  onSelectNode,
  clickCallback,
  holdCallback,
  openContextMenu,
  parent,
  pX,
  pY,
  isInColumn = false,
  ...props
}) => {
  const dragRef = useRef();

  const { selectedNode, handleSelectNode } = useContext(SelectedNodeContext);

  const [isSelected, setIsSelected] = useState(false);
  useEffect(() => {
    if (selectedNode !== undefined) {
      setIsSelected(!!selectedNode[props.nodeId]);
    }
  }, [selectedNode]);

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
        handleSelectNode(e, { ref: dragRef, ...onSelectNode });
      }
    },
    isSelected,
    clickCallback,
    holdCallback
  );

  if (!!animate) animate();
  return (
    <ResizeObserver
      onResize={canResize ? (!!props.onResize ? props.onResize : null) : null}
    >
      <Card
        ref={dragRef}
        position={isInColumn ? "relative" : "absolute"}
        transform={
          isInColumn ? "translate(0px, 0px)" : `translate(${pX}px, ${pY}px)`
        }
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
        {...props}
      >
        {props.children}
      </Card>
    </ResizeObserver>
  );
};

export default NodeWrapper;
