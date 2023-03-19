import { Box, Text } from "@chakra-ui/react";
import { is } from "date-fns/locale";
import React from "react";
import { useDragLayer } from "react-dnd";
import { BoardObjects, SidebarObjects } from "../enums/items";
import Note from "./Note";

function DragLayerComponent(props) {
  const { item, itemType, currentOffset, isDragging } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  // don't render anything if not dragging
  if (!currentOffset) {
    return null;
  }

  // get x and y coordinates of current offset
  const { x, y } = currentOffset;

  // render a box with a label at current offset position
  switch (itemType) {
    case BoardObjects.NOTE:
      console.log(isDragging);
      return (
        <Text
          bgColor="green.300"
          opacity={1}
          position="absolute"
          left={x - 100 + "px"}
          top={y + "px"}
          width={item.props()?.sX + "px"}
          height={item.props()?.sY + "px"}
          border="1px solid"
          borderColor="inherit"
          rounded="md"
        >
          {"YUUUPPPPPP"}
        </Text>
      );
  }
}

export default DragLayerComponent;
