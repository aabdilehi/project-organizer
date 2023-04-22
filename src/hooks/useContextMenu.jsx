import {
  Menu,
  MenuItem,
  MenuList,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, createContext, useMemo } from "react";
import { useContext } from "react";
import { useRef, useState } from "react";

export const ContextMenuContext = React.createContext(); // stupid name I know

export const ContextMenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copiedNodes, copyNodes] = useState([]); // array because it should be possible to select multiple nodes in the future

  const contextValue = useMemo(
    () => ({
      menuItems,
      setMenuItems,
      mousePos,
      setMousePos,
      copiedNodes,
      copyNodes,
    }),
    [menuItems, setMenuItems, mousePos, setMousePos, copiedNodes, copyNodes]
  );
  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
    </ContextMenuContext.Provider>
  );
};

export function useContextMenu({ containerRef }) {
  const { menuItems, setMenuItems, mousePos, setMousePos } =
    useContext(ContextMenuContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleRightClick = (event) => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;

    setMousePos({ x: mouseX, y: mouseY });
    onOpen();
  };

  const ContextMenu = () => {
    const styleProps = {
      rounded: "none",
      style: {
        border: "none",
        outline: "none",
        ":focus": {
          border: "none",
          outline: "none",
        },
      },
    };
    return (
      <Menu
        isOpen={isOpen}
        gutter={0}
        closeOnBlur={true}
        onClose={onClose}
        isLazy
      >
        <MenuList
          top={mousePos.y + "px"}
          left={mousePos.x + "px"}
          pt={1}
          pb={1}
          position="absolute"
          h={"fit-content"}
          rounded={"sm"}
        >
          {React.Children.map(menuItems, (item) =>
            item.type === MenuItem
              ? React.cloneElement(item, styleProps)
              : React.cloneElement(item)
          )}
        </MenuList>
      </Menu>
    );
  };

  return {
    handleRightClick,
    ContextMenu,
  };
}
