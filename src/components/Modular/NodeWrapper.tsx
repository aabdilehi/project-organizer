import React, {
  forwardRef,
  LegacyRef,
  ReactElement,
  useCallback,
  useContext,
  useRef,
} from "react";
import {
  addSelectNode,
  selectNode,
  toggleSelectNode,
} from "../../utils/slices/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ResizeWrapper from "./ResizeWrapper";
import { updatePosition } from "../../utils/slices/nodeActions";
import { StoreState } from "../../utils/enums/state-type";
import { BoardObjects } from "../../utils/enums/items";

const NodeWrapper = forwardRef(
  (
    {
      id,
      type,
      className,
      canPosition = true,
      canResize = false,
      parent,
      pX = 0,
      pY = 0,
      sX,
      sY,
      isInColumn = false,
      preview = false,
      columnWidth,
      onContextMenu,
      ...props
    }: {
      id: string;
      type: string;
      className?: string;
      canPosition: boolean;
      canResize: boolean;
      pX: Number;
      pY: Number;
      sX?: Number;
      sY?: Number;
      parent: { id: string; type: string };
      clickCallback?: (params?: any[]) => void;
      menuProps?: { [menuProp: string]: boolean };
      menuItems?: Element[];
      isInColumn?: boolean;
      columnWidth?: Number;
      preview?: boolean;
      onContextMenu?: React.MouseEventHandler<HTMLDivElement> | undefined;
      children?: ReactElement[];
    },
    nodeRef: LegacyRef<HTMLDivElement>
  ) => {
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

    const [selected, selectData]: [
      boolean,
      {
        id: string;
        type: BoardObjects;
        parent: {
          id: string;
          type: BoardObjects;
        };
      }
    ] = useSelector((state: StoreState) => [
      state.selection.hasOwnProperty(id),
      state.selection[id],
    ]);

    const dragging: boolean = useSelector((state: StoreState) =>
      state.drag.hasOwnProperty(id)
    );
    const dispatch = useDispatch();

    const handleSelect = (e) => {
      if (e.shiftKey) {
        dispatch(addSelectNode({ id, type, parent }));
        return;
      } else if (e.ctrlKey) {
        dispatch(toggleSelectNode({ id, type, parent }));
        return;
      } else {
        dispatch(selectNode({ id, type, parent }));
        return;
      }
    };
    // update info if out of date i guess
    const updateSelectData = () => {
      if (!selected) return;

      // check parent data exists
      if (!selectData.hasOwnProperty("parent")) return;

      // check parent data is consistent
      if (
        selectData.parent.id == parent.id &&
        selectData.parent.type == parent.type
      )
        return;

      dispatch(addSelectNode({ id, type, parent }));
    };
    updateSelectData();
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
        data-selected={selected}
        onClick={(e) => {
          e.stopPropagation();
          if (!selected) {
            handleSelect(e);
          }
        }}
        draggable={canPosition}
        className={`node ${type}${isInColumn ? " in-column" : ""}${
          selected ? " selected" : ""
        }${!!className ? " " + className : ""}${
          dragging && !preview ? " dragging" : ""
        }`}
        style={{
          width: `${columnWidth}px`,
          transform: `translate(${pX}px, ${pY}px)`,
        }}
        tabIndex={-1}
        onContextMenu={(e) => {
          e.stopPropagation();
          if (!selected) {
            handleSelect(e);
          }
          if (!onContextMenu) return;
          onContextMenu(e);
        }}
        onDragStart={(e) => {
          if (!selected) {
            handleSelect(e);
          }
        }}
        {...props}
      >
        {props.children}
      </div>
    );
  }
);

export default NodeWrapper;
