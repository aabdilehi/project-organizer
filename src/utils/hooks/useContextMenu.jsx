import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useContext } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  updatePosition,
} from "../slices/nodeActions";
import { BoardObjects } from "../enums/items";
//import { removeBoard } from "../slices/boardSlice";

export const ContextMenuContext = React.createContext(); // stupid name I know

export const ContextMenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copiedNodes, copyNodes] = useState([]);
  const [menuProps, setMenuProps] = useState({});
  const [target, setTarget] = useState(null);
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
      target,
      setTarget,
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
      target,
      setTarget,
    ]
  );
  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
    </ContextMenuContext.Provider>
  );
};

export function useContextMenu({ containerRef, boardId }) {
  const nodes = useSelector((state) =>
    state
      ? {
          ...state.boards,
          ...state.columns,
          ...state.notes,
          ...state.documents,
        }
      : {}
  );

  const {
    menuItems = [],
    setMenuItems,
    menuProps,
    setMenuProps,
    mousePos,
    setMousePos,
    copiedNodes,
    copyNodes,
    target,
  } = useContext(ContextMenuContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRightClick = useCallback((event) => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;

    setMousePos({ x: mouseX, y: mouseY });
    onOpen();
  }, []);

  const ContextMenu = () => {
    // I think paste should still be custom (?)
    const contextRef = useRef();
    const {
      canCopy = false,
      canCut = false,
      canDelete = false,
      canPaste = false,
      delete: del = () => {},
      paste = () => {},
    } = menuProps;
    // const { selectedNode, setSelectedNode } = useContext(SelectedNodeContext);

    const selectedNodes = useSelector((state) => state.selection);
    const copiedNodeData = useSelector((state) => {
      if (!selectedNodes) return;
      return Object.keys(selectedNodes).map((key) => {
        return state[`${selectedNodes[key].type}s`][key];
      });
    });
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

    const deleteNode = (id, depth = 0) => {
      const node = nodes[id];

      if (depth <= 0) {
        const parent = selectedNodes[id].parent;
        dispatch(
          removeChild.action({
            id: parent.id,
            type: parent.type,
            cId: id,
          })
        );
      }

      if (!!node.childRefs) {
        if (node.childRefs.length > 0) {
          console.log(node.childRefs);
          node.childRefs.forEach(({ childId, childType }) => {
            deleteNode(childId, depth + 1);
          });
        }
      }

      dispatch(removeNode.action({ id, type: node.type }));
      return;
    };

    const copyAllNodes = (cut = false) => {
      let bruha = {};
      const copyNode = (id) => {
        const node = nodes[id];

        if (!!node.childRefs) {
          if (node.childRefs.length > 0) {
            console.log(node.childRefs);
            node.childRefs.forEach(({ childId, ...item }) => {
              copyNode(childId);
            });
          }
        }
        bruha[id] = node;
        return;
      };

      Object.keys(selectedNodes).forEach((key) => {
        copyNode(key);
      });

      copyNodes(Object.values(bruha));

      if (cut) {
        // Separate loop as you can select parent and children at the same time
        Object.keys(selectedNodes).forEach((key) => {
          deleteNode(key, 0);
        });
      }
    };

    const pasteAllNodes = () => {
      // Create new IDs for nodes and create dictionary to allow assignment
      const mappedIDs = {};
      copiedNodes.forEach((item) => {
        mappedIDs[item.id] = uuidv4();
      });

      let handledGuys = [];

      const pasteNode = ({ parent, ...node }) => {
        const n = {
          ...node,
          id: mappedIDs[node.id], // Assigning the new Id to this node
        };

        // Check for presence of children
        if (!!node.childRefs) {
          if (node.childRefs.length > 0) {
            // Assigning the new IDs to the children

            n.childRefs = node.childRefs.map(({ childId, childType }) => {
              // These nodes are bypassing the addChild action so I am marking them here
              // Any nodes that are not in the handledGuys array are, therefore, top-level nodes
              // I, then, need to dispatch the addChild action on top-level nodes to add them to the target
              handledGuys.push(mappedIDs[childId]);

              return {
                childId: mappedIDs[childId],
                childType,
              };
            });
          }
        }

        // Creating the node itself (again, with the children pre-added so no need for addChild action)
        // Have to do this as
        dispatch(addNode.action(n));
        return;
      };

      // Just the children
      copiedNodes.forEach((item) => pasteNode(item));

      // Now the top level guys
      copiedNodes.forEach((item) => {
        if (!handledGuys.includes(mappedIDs[item.id])) {
          // Currently only illegal combo is column on column so check for that
          if (
            item.type === BoardObjects.COLUMN &&
            target.type === BoardObjects.COLUMN
          ) {
            dispatch(
              addChild.action({
                id: boardId,
                type: BoardObjects.BOARD,
                cId: mappedIDs[item.id],
                cType: item.type,
              })
            );
          } else {
            dispatch(
              addChild.action({
                id: target.id,
                type: target.type,
                cId: mappedIDs[item.id],
                cType: item.type,
              })
            );
          }

          let offset = {
            x: item.pX - target.pX,
            y: item.pY - target.pY,
          };
          dispatch(
            updatePosition.action({
              id: mappedIDs[item.id],
              type: item.type,
              pX: mousePos.x,
              pY: mousePos.y,
            })
          );
        }
      });
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
                    copyAllNodes(true);
                  }}
                >
                  Cut
                </MenuItem>
              ) : null}
              {canCopy ? (
                <MenuItem
                  onClick={() => {
                    copyAllNodes();
                  }}
                >
                  Copy
                </MenuItem>
              ) : null}
              {canDelete ? (
                <MenuItem
                  onClick={() => {
                    Object.keys(selectedNodes).forEach((key) => {
                      deleteNode(key, 0);
                    });
                  }}
                >
                  Delete
                </MenuItem>
              ) : null}
              {canPaste ? (
                <MenuItem
                  onClick={() => {
                    pasteAllNodes();
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
