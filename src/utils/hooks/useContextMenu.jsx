import {
  Menu,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef } from "react";
import { useContext } from "react";
import { useState } from "react";
import { SelectedNodeContext } from "../../App";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { BoardObjects } from "../enums/items";
//import { removeBoard } from "../slices/boardSlice";

export const ContextMenuContext = React.createContext(); // stupid name I know

export const ContextMenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copiedNodes, copyNodes] = useState([]); // array because it should be possible to select multiple nodes in the future
  const [menuProps, setMenuProps] = useState({});
  const contextValue = useMemo(
    () => ({
      menuItems,
      setMenuItems,
      menuProps,
      setMenuProps,
      mousePos,
      setMousePos,
      copiedNodes,
      copyNodes,
    }),
    [
      menuItems,
      setMenuItems,
      menuProps,
      setMenuProps,
      mousePos,
      setMousePos,
      copiedNodes,
      copyNodes,
    ]
  );
  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
    </ContextMenuContext.Provider>
  );
};

export function useContextMenu({ containerRef }) {
  const {
    menuItems,
    setMenuItems,
    menuProps,
    setMenuProps,
    mousePos,
    setMousePos,
    copiedNodes,
    copyNodes,
  } = useContext(ContextMenuContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleRightClick = (event) => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;

    setMousePos({ x: mouseX, y: mouseY });
    onOpen();
  };

  const ContextMenu = () => {
    // I think paste should still be custom (?)
    const contextRef = useRef();
    const {
      canCopy,
      canCut,
      canDelete,
      canPaste,
      delete: del,
      paste,
    } = menuProps;
    const { selectedNode, setSelectedNode } = useContext(SelectedNodeContext);
    const dispatch = useDispatch();

    useEffect(() => {
      const handleClick = (e) => {
        e.stopPropagation();
        if (
          e.currentTarget !== contextRef.current ||
          e.currentTarget.parentNode !== contextRef.current
        ) {
          onClose();
        }
      };
      window.addEventListener("click", handleClick);
      return () => {
        window.removeEventListener("click", handleClick);
      };
    }, []);

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
          ref={contextRef}
          rounded={"sm"}
        >
          {!!canCopy || !!canCut || !!canDelete || !!canPaste ? (
            <MenuGroup title="Standard Node Actions">
              {canCut ? (
                <MenuItem
                  onClick={() => {
                    const a = Object.values(selectedNode);

                    del();
                    copyNodes(a);
                  }}
                >
                  Cut
                </MenuItem>
              ) : null}
              {canCopy ? (
                <MenuItem
                  onClick={() => {
                    const a = Object.values(selectedNode);
                    copyNodes(a);
                  }}
                >
                  Copy
                </MenuItem>
              ) : null}
              {canDelete ? (
                <MenuItem
                  onClick={() => {
                    Object.values(selectedNode).forEach(() => {
                      del();
                    });
                  }}
                >
                  Delete
                </MenuItem>
              ) : null}
              {canPaste ? (
                <MenuItem
                  onClick={() => {
                    const mappedIDs = {};
                    Object.values(copiedNodes).forEach((item) => {
                      mappedIDs[item.id] = uuidv4();
                    });
                    console.log(mappedIDs);
                    const a = Object.values(copiedNodes).map((item) => {
                      const node = item;
                      console.log(node);
                      node.id = mappedIDs[node.id];

                      // Check if parent's ID is in object.
                      // if true, use mappedIDs to update; else assign id of node that triggered the paste
                      node.parent = !!mappedIDs[node.parent.id]
                        ? mappedIDs[node.parent.id]
                        : undefined; // paste node id;
                      if (!node.children) return node;
                      // Update children of IDS
                      node.children = node.children.map((item) => {
                        const child = { ...item };
                        child.id = mappedIDs[child.id];
                        return child;
                      });

                      return node;
                    });
                    console.log(a);
                    paste(a);
                  }}
                >
                  Paste
                </MenuItem>
              ) : null}
            </MenuGroup>
          ) : null}

          <MenuGroup title="Exclusive Node Actions">
            {React.Children.map(menuItems, (item) =>
              item.type === MenuItem
                ? React.cloneElement(item, styleProps)
                : item
            )}
          </MenuGroup>
        </MenuList>
      </Menu>
    );
  };

  return {
    handleRightClick,
    ContextMenu,
    onClose,
  };
}
