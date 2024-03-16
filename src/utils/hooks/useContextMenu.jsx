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
import { removeChild, removeNode } from "../slices/nodeActions";
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
  const boards = useSelector((state) => state.boards);
  const columns = useSelector((state) => state.columns);
  const dispatch = useDispatch();
  const handleRightClick = (event) => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;

    setMousePos({ x: mouseX, y: mouseY });
    onOpen();
  };

  const handleDelete = (id, type, parent) => {
    // column
    const deleteBoard = () => {
      const board = boards[id];
      if (!board) return;

      board.childRefs.forEach(({ childId, childType }) => {
        handleDelete(childId, childType, board);
      });

      dispatch(
        removeChild.action({ id: parent.id, type: parent.type, cId: id })
      );
      dispatch(removeNode.action({ id, type: BoardObjects.BOARD }));
    };

    // column
    const deleteColumn = () => {
      const column = columns[id];
      if (!column) return;

      column.childRefs.forEach(({ childId, childType }) => {
        handleDelete(childId, childType, column);
      });

      dispatch(
        removeChild.action({ id: parent.id, type: parent.type, cId: id })
      );
      dispatch(removeNode.action({ id, type: BoardObjects.COLUMN }));
    };

    // note, task, picture, document
    const deleteOther = () => {
      dispatch(
        removeChild.action({ id: parent.id, type: parent.type, cId: id })
      );
      dispatch(removeNode.action({ id, type }));
    };

    switch (type) {
      case BoardObjects.BOARD:
        deleteBoard();
        break;
      case BoardObjects.COLUMN:
        deleteColumn();
        break;
      default:
        deleteOther();
        break;
    }
  };

  const ContextMenu = () => {
    // I think paste should still be custom (?)
    const contextRef = useRef();
    const { canCopy, canCut, canDelete, canPaste, paste } = menuProps;
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
                    const selectedNodesArr = Object.values(selectedNode);
                    if (
                      selectedNodesArr.length > 1 ||
                      selectedNodesArr.some(
                        (value) =>
                          value.type == BoardObjects.COLUMN ||
                          value.type == BoardObjects.BOARD
                      )
                    ) {
                      const result = window.confirm(
                        "Are you sure you wish to delete these nodes?"
                      );
                      if (!result) return;
                    }
                    Object.values(selectedNode).forEach((item) => {
                      handleDelete(item.id, item.type, item.parent);
                    });
                    copyNodes(selectedNodesArr);
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
                    const selectedNodesArr = Object.values(selectedNode);
                    if (
                      selectedNodesArr.length > 1 ||
                      selectedNodesArr.some(
                        (value) =>
                          value.type == BoardObjects.COLUMN ||
                          value.type == BoardObjects.BOARD
                      )
                    ) {
                      const result = window.confirm(
                        "Are you sure you wish to delete these nodes?"
                      );
                      if (!result) return;
                    }
                    Object.values(selectedNode).forEach((item) => {
                      handleDelete(item.id, item.type, item.parent);
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
                    const a = Object.values(copiedNodes).map((item) => {
                      const node = item;
                      node.id = mappedIDs[node.id];

                      // Check if parent's ID is in object.
                      // if true, use mappedIDs to update; else assign id of node that triggered the paste
                      node.parent = !!mappedIDs[node.parent.id]
                        ? { ...node.parent, id: mappedIDs[node.parent.id] }
                        : undefined; // paste node id;
                      if (!node.childRefs) return node;
                      // Update childRefs of IDS
                      node.childRefs = node.childRefs
                        .map((item2) => {
                          const child = {
                            ...item2,
                            childId: !!mappedIDs[item2.childId]
                              ? mappedIDs[item2.childId]
                              : undefined,
                          };
                          return child;
                        })
                        .filter((item2) => item2.childID !== undefined);

                      return node;
                    });
                    paste(a);
                  }}
                >
                  Paste
                </MenuItem>
              ) : null}
            </MenuGroup>
          ) : null}

          {menuItems.length > 0 && (
            <MenuGroup title="Exclusive Node Actions">
              {React.Children.map(menuItems, (item) =>
                item.type === MenuItem
                  ? React.cloneElement(item, styleProps)
                  : item
              )}
            </MenuGroup>
          )}
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
