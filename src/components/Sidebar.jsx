import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";

import { SidebarObjects } from "../utils/enums/items";
import {
  Button,
  Card,
  Center,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import {
  IconArrowBack,
  IconArrowLeft,
  IconCheckbox,
  IconFileText,
  IconHome,
  IconLayoutDashboard,
  IconNote,
  IconPhoto,
  IconStack2,
} from "@tabler/icons-react";
import { withRouter } from "./ComponentWithRouterProp";
import { useSelector } from "react-redux";

const Sidebar = ({ router }) => {
  const { id } = router.params;
  const [board, setBoard] = useState();
  const bruh = useSelector((state) => state.boards[!!id ? id : "root"]);
  useEffect(() => {
    setBoard(bruh);
  }, [id]);

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
      <Button
        w={"full"}
        h={"1.6em"}
        onClick={() => {
          router.navigate(`/`);
        }}
        isDisabled={!board || board.id === "root"}
      >
        <IconHome />
      </Button>
      <Button
        w={"full"}
        h={"1.6em"}
        onClick={() => {
          router.navigate(
            board.parent.id === "root" ? `/` : `/${board.parent.id}`
          );
        }}
        isDisabled={!board || !board.parent}
      >
        <IconArrowLeft />
      </Button>

      <SidebarObject
        name="Board"
        type={SidebarObjects.BOARD}
        icon={<IconLayoutDashboard />}
      />
      <SidebarObject
        name="Note"
        type={SidebarObjects.NOTE}
        icon={<IconNote />}
      />
      <SidebarObject
        name="Document"
        type={SidebarObjects.DOCUMENT}
        icon={<IconFileText />}
      />
      <SidebarObject
        name="Column"
        type={SidebarObjects.COLUMN}
        icon={<IconStack2 />}
      />
      <SidebarObject
        name="To-do"
        type={SidebarObjects.TODO}
        icon={<IconCheckbox />}
      />
      <SidebarObject
        name="Image"
        type={SidebarObjects.IMAGE}
        icon={<IconPhoto />}
      />
    </Stack>
  );
};

const SidebarObject = ({ name, type, icon }) => {
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
      <Center
        css={css`
          height: auto;
          width: auto;
        `}
      >
        {icon}
      </Center>
      <Text>{name}</Text>
    </Card>
  );
};

export default withRouter(Sidebar);
