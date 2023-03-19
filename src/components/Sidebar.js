/** @jsxImportSource @emotion/react */
import { useState, useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { useDrag } from "react-dnd";

import { SidebarObjects } from "../enums/items";
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

const Sidebar = () => {
  return (
    <Stack
      bgColor="gray.800"
      m={0}
      p={0}
      pl={2.5}
      pt={3}
      direction={"column"}
      h="full"
      minH="100%"
      w={"100px"}
      alignItems="center"
    >
      <SidebarObject name="Note" type={SidebarObjects.NOTE} />
      <SidebarObject name="Column" type={SidebarObjects.COLUMN} />
      <SidebarObject name="To-do" type={SidebarObjects.TODO} />
      <SidebarObject name="Image" type={SidebarObjects.IMAGE} />
    </Stack>
  );
};

const SidebarObject = ({ name, type }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: { type: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(ref);

  return (
    <Card
      h={"fit-content"}
      p={2}
      w="full"
      ref={ref}
      dir="column"
      alignItems={"center"}
      _hover={{ bgColor: "gray.600", cursor: "pointer" }}
    >
      <Box
        css={css`
          background-color: red;
          height: 50px;
          width: 50px;
        `}
      ></Box>
      <Text>{name}</Text>
    </Card>
  );
};

export default Sidebar;
