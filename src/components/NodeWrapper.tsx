import React, { useContext, useRef } from "react";
import {
  addSelectNode,
  selectNode,
  toggleSelectNode,
} from "../utils/slices/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ResizeWrapper from "./ResizeWrapper";
import { updatePosition } from "../utils/slices/nodeActions";

const NodeWrapper = ({
  id,
  type,
  className,
  canPosition = true,
  canResize = false,
  menuItems = [],
  menuProps = {},
  onSelectNode,
  openContextMenu,
  parent,
  pX = 0,
  pY = 0,
  sX = 200,
  sY = 200,
  isInColumn = false,
  ...props
}: {
  id: string;
  type: string;
  className?: string;
  canPosition: boolean;
  openContextMenu: (params?: any[]) => void;
  canResize: boolean;
  pX: Number;
  pY: Number;
  sX?: Number;
  sY?: Number;
  parent: { id: string; type: string };
  clickCallback?: (params?: any[]) => void;
  onSelectNode: { [key: string]: any };
  menuProps?: { [menuProp: string]: boolean };
  menuItems?: Element[];
  isInColumn?: boolean;
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

  let isSelected = selectedNodes !== undefined && !!selectedNodes[id];

  // update info if out of date i guess
  if (selectedNodes !== undefined && isSelected) {
    if (
      // check info is inconsistent first
      !!selectedNodes[id] &&
      !!selectedNodes[id].parent &&
      selectedNodes[id].parent.id != onSelectNode.parent.id
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
  //         id: id,
  //         type,
  //         pX: nodeBounds.left,
  //         pY: nodeBounds.top,
  //       })
  //     );
  //   }
  // }
  //#endregion
  return (
    <div
      ref={nodeRef}
      id={id}
      data-isincolumn={isInColumn}
      data-selected={isSelected}
      onClick={(e) => {
        e.stopPropagation();
        if (!isSelected) {
          handleSelect(e);
        }
      }}
      draggable={canPosition}
      className={`node ${type}${isInColumn ? " in-column" : ""}${
        isSelected ? " selected" : ""
      }${!!className ? " " + className : ""}`}
      style={{
        transform: `translate(${pX}px, ${pY}px)`,
        height: !!sY ? sY + "px" : undefined,
        width: !!sX ? sX + "px" : undefined,
      }}
      tabIndex={-1}
      onContextMenuCapture={(e) => {
        if (!isSelected) {
          handleSelect(e);
        }
      }}
      onTouchStart={(e) => {
        if (!isSelected) {
          handleSelect(e);
        }
      }}
      onDragStartCapture={(e) => {
        if (!isSelected) {
          handleSelect(e);
        }
      }}
      {...props}
    >
      <ResizeWrapper resizeRef={nodeRef} canResize={canResize}>
        {props.children}
      </ResizeWrapper>
    </div>
  );
};

export default NodeWrapper;
