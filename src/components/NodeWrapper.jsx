import React, { useContext, useRef } from "react";
import { ContextMenuContext } from "../utils/hooks/useContextMenu";
import {
  addSelectNode,
  selectNode,
  toggleSelectNode,
} from "../utils/slices/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ResizeWrapper from "./ResizeWrapper";
import { updatePosition } from "../utils/slices/nodeActions";

const NodeWrapper = ({
  canPosition,
  canResize,
  menuProps,
  menuItems,
  onSelectNode,
  clickCallback,
  openContextMenu,
  parent,
  pX,
  pY,
  sX,
  sY,
  isInColumn = false,
  ...props
}) => {
  const nodeRef = useRef();

  //#region Click outside
  // useLayoutEffect(() => {
  //   if(!nodeRef.current) return;
  //   const checkClickInside = (e) => !!nodeRef.current && nodeRef.current.contains(e.target);

  //   const clickOutside = (e) => {
  //     if(checkClickInside(e)) return;
  //     dispatch(clearSelectNode)
  //   }
  //   window.addEventListener("click", )
  // }, [])
  //#endregion

  //#region Select node

  const selectedNodes = useSelector((state) => state.selection);
  const dispatch = useDispatch();

  const handleSelect = (e) => {
    console.log(selectedNodes);
    if (e.shiftKey) {
      dispatch(addSelectNode(onSelectNode));
      return;
    } else if (e.ctrlKey) {
      dispatch(toggleSelectNode(onSelectNode));
      return;
    } else {
      dispatch(selectNode(onSelectNode));
      return;
    }
  };

  let isSelected = selectedNodes !== undefined && !!selectedNodes[props.nodeId];

  // update info if out of date i guess
  if (selectedNodes !== undefined && isSelected) {
    if (
      // check info is inconsistent first
      !!selectedNodes[props.nodeId] &&
      !!selectedNodes[props.nodeId].parent &&
      selectedNodes[props.nodeId].parent.id != onSelectNode.parent.id
    ) {
      dispatch(addSelectNode(onSelectNode));
    }
  }

  //#endregion

  //#region  Would be nice if the stored position of the node would update automatically based on the actual element's position
  // if (!!nodeRef.current) {
  //   const nodeBounds = nodeRef?.current?.getBoundingClientRect() ?? undefined;
  //   if (
  //     !!nodeBounds &&
  //     (nodeRef.current.getBoundingClientRect().left !== pX ||
  //       nodeRef.current.getBoundingClientRect().top !== pY)
  //   ) {
  //     dispatch(
  //       updatePosition.action({
  //         id: props.nodeId,
  //         type: props.nodeType,
  //         pX: nodeBounds.left,
  //         pY: nodeBounds.top,
  //       })
  //     );
  //   }
  // }
  //#endregion

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

  return (
    <div
      ref={nodeRef}
      data-nodeid={props.nodeId}
      data-isincolumn={isInColumn}
      data-selected={isSelected}
      onClick={(e) => {
        if (isSelected) {
          clickCallback(e);
        }
      }}
      draggable={canPosition}
      className={`node ${props.nodeType}${isInColumn ? " in-column" : ""}${
        isSelected ? " selected" : ""
      }`}
      style={{
        transform: `translate(${pX}px, ${pY}px)`,
        height: sY + "px",
        width: sX + "px",
      }}
      tabIndex={-1}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        updateContextMenu();
        openContextMenu(e);
      }}
      onDragStartCapture={(e) => {
        if (!isSelected) {
          handleSelect(e);
        }
      }}
      onContextMenuCapture={(e) => {
        if (!isSelected) {
          handleSelect(e);
        }
      }}
      onClickCapture={(e) => {
        if (!isSelected) {
          handleSelect(e);
        }
      }}
    >
      <ResizeWrapper resizeRef={nodeRef} canResize={canResize}>
        {props.children}
      </ResizeWrapper>
    </div>
  );
};

export default NodeWrapper;
