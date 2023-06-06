import { useRef } from "react";
import { css } from "@emotion/react";

import { SidebarObjects } from "../utils/enums/items";
import { Box, Card, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";

const Sidebar = () => {
  return (
    <Stack
      bgColor={useColorModeValue("gray.300", "gray.700")}
      m={0}
      p={2.5}
      flex={1}
      direction={"column"}
      h="full"
      minH="100%"
      w={"100px"}
      alignItems="center"
    >
      <SidebarObject name="Board" type={SidebarObjects.BOARD} />
      <SidebarObject name="Note" type={SidebarObjects.NOTE} />
      <SidebarObject name="Document" type={SidebarObjects.DOCUMENT} />
      <SidebarObject name="Column" type={SidebarObjects.COLUMN} />
      <SidebarObject name="To-do" type={SidebarObjects.TODO} />
      <SidebarObject name="Image" type={SidebarObjects.IMAGE} />
    </Stack>
  );
};

const SidebarObject = ({ name, type }) => {
  const ref = useRef(null);

  const handleDragStart = (event) => {
    // Should set this to plain text but the function reading this is expecting json
    event.dataTransfer.setData("application/json", JSON.stringify({ type }));
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      h={"fit-content"}
      p={2}
      w="full"
      ref={ref}
      dir="column"
      fontSize={15}
      alignItems={"center"}
      bgColor={useColorModeValue("gray.200", "gray.600")}
      _hover={useColorModeValue(
        { bgColor: "gray.100", cursor: "pointer" },
        { bgColor: "gray.500", cursor: "pointer" }
      )}
    >
      <Box
        css={css`
          background-color: red;
          height: 40px;
          width: 40px;
        `}
      ></Box>
      <Text>{name}</Text>
    </Card>
  );
};

export default Sidebar;
