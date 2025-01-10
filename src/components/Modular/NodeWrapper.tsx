import React, {
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { RootState } from "../../store";
import {
  addSelectNode,
  selectNode,
  toggleSelectNode,
} from "../../utils/slices/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import { updatePosition, updateSize } from "../../utils/slices/nodeActions";
import { BoardObjects } from "../../utils/enums/items";
import { debounce } from "lodash";

export default forwardRef(
  (
    {
      id,
      type,
      className,
      canPosition = true,
      canResize = false,
      parentId,
      parentType,
      pX = 0,
      pY = 0,
      sX,
      sY,
      isInColumn = false,
      preview = false,
      columnWidth,
      onContextMenu,
      scale,
      offset,
      ...props
    }: {
      id: string;
      type: string;
      className?: string;
      canPosition: boolean;
      canResize: boolean;
      pX: number;
      pY: number;
      sX?: number;
      sY?: number;
      scale?: any;
      offset?: any;
      parentId: string;
      parentType: string;
      clickCallback?: (params?: any[]) => void;
      menuProps?: { [menuProp: string]: boolean };
      menuItems?: Element[];
      isInColumn?: boolean;
      columnWidth?: number;
      preview?: boolean;
      onContextMenu?: React.MouseEventHandler<HTMLDivElement> | undefined;
      children?: ReactElement[];
    },
    ref: any
  ) => {
    const dispatch = useDispatch();
    const selected = useSelector((state: RootState) =>
      state.selection.hasOwnProperty(id)
    );

    const selectData = useSelector((state: RootState) => state.selection);
    const dragging = useSelector((state: RootState) =>
      state.drag.nodes.hasOwnProperty(id)
    );
    const isActuallyInColumn =
      (!preview && parentType === BoardObjects.COLUMN) ||
      (preview && isInColumn);

    const handleSelect = (event, force = false) => {
      if (event.shiftKey && force == false) {
        dispatch(
          addSelectNode({
            id,
            type,
            parent: { id: parentId, type: parentType },
          })
        );
        return;
      } else if (event.ctrlKey && force == false) {
        dispatch(
          toggleSelectNode({
            id,
            type,
            parent: { id: parentId, type: parentType },
          })
        );
        return;
      } else {
        dispatch(
          selectNode({
            id,
            type,
            parent: { id: parentId, type: parentType },
          })
        );
        return;
      }
    };

    const updateSelectData = () => {
      if (!selected) return;

      // check parent data exists
      if (!selectData[id].hasOwnProperty("parent")) return;

      // check parent data is consistent
      if (
        selectData[id].parent.id == parentId &&
        selectData[id].parent.type == parentType
      )
        return;
      dispatch(
        addSelectNode({
          id,
          type,
          parent: { id: parentId, type: parentType },
        })
      );
    };

    const updateRealPosition = () => {
      //#region  Would be nice if the stored position of the node would update automatically based on the actual element's position
      if (!nodeRef.current) return;
      if (!!nodeRef.current && isActuallyInColumn) {
        const nodeBounds =
          nodeRef?.current?.getBoundingClientRect() ?? undefined;
        if (
          !!nodeBounds &&
          (nodeRef.current.getBoundingClientRect().left !== pX ||
            nodeRef.current.getBoundingClientRect().top !== pY)
        ) {
          dispatch(
            updatePosition.action({
              id,
              type,
              pX: nodeBounds.left,
              pY: nodeBounds.top,
            })
          );
        }
      }
      //#endregion
    };

    const nodeRef = useRef<HTMLDivElement>(null);
    const direction = useRef<string>("none");
    useImperativeHandle(ref, () => nodeRef.current!, []);
    const updatingSize = useRef(false);
    if (nodeRef.current && updatingSize.current != false) {
      if (!preview && sX && sY) {
        const bounds = nodeRef.current.getBoundingClientRect();
        if (
          !!bounds &&
          (Math.abs(sX! - bounds.width / scale) > 10 ||
            Math.abs(sY! - bounds.height / scale) > 10)
        ) {
          updatingSize.current = true;
          console.log(
            `Type: ${type}\nx: ${Math.abs(
              sX! - bounds.width / scale
            )}px\ny: ${Math.abs(sY! - bounds.height / scale)}px`
          );
          dispatch(
            updateSize.action({
              id,
              type,
              sX: bounds.width / scale,
              sY: bounds.height / scale,
            })
          );
        }
      }
    }
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

    // update info if out of date i guess
    updateSelectData();

    //#endregion

    return (
      <div
        ref={nodeRef}
        id={id}
        data-isincolumn={isActuallyInColumn}
        data-selected={selected}
        onClick={(e) => {
          e.stopPropagation();
          if (!selected) {
            handleSelect(e);
          }
        }}
        draggable={canPosition}
        className={`node ${type}${isActuallyInColumn ? " in-column" : ""}${
          selected ? " selected" : ""
        }${!!className ? " " + className : ""}${
          dragging && !preview ? " dragging" : ""
        }`}
        style={{
          width: columnWidth ? `${columnWidth}px` : sX ? `${sX}px` : undefined,
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
          // HOLY SHIT THIS SOLVES MY ISSUE
          // ADDING A PLACEHOLDER DATATRANSFER DATA THAT CONTAINS THE TYPE OF DRAG AND THE ID OF THE NODE
          // IF THE DATA IS SET THEN NODES IGNORE
          if (e.dataTransfer.types.length <= 0) {
            if (!selected) {
              handleSelect(e);
            }

            if (isActuallyInColumn) {
              e.dataTransfer.setData("origin/column", "Placeholder");
            } else {
              e.dataTransfer.setData("origin/board", "Placeholder");
            }
            const bounds = nodeRef.current?.getBoundingClientRect();
            if (!bounds) return;
            const resizePadding = Math.min(8, (8 * Number(sX)) / bounds.width);
            let direction = "none";
            if (e.clientX - bounds.left < resizePadding) {
              direction = "left";
            }
            if (e.clientY - bounds.top < resizePadding) {
              direction = "top";
            }
            if (e.clientY - bounds.top > bounds.height - resizePadding) {
              direction = "bottom";
            }
            if (e.clientX - bounds.left > bounds.width - resizePadding) {
              direction = "right";
            }
            if (
              e.clientX - bounds.left < resizePadding &&
              e.clientY - bounds.top < resizePadding
            ) {
              direction = "top-left";
            }
            if (
              e.clientX - bounds.left < resizePadding &&
              e.clientY - bounds.top > bounds.height - resizePadding
            ) {
              direction = "bottom-left";
            }
            if (
              e.clientX - bounds.left > bounds.width - resizePadding &&
              e.clientY - bounds.top < resizePadding
            ) {
              direction = "top-right";
            }
            if (
              e.clientX - bounds.left > bounds.width - resizePadding &&
              e.clientY - bounds.top > bounds.height - resizePadding
            ) {
              direction = "bottom-right";
            }

            if (direction !== "none") {
              e.dataTransfer.setData(
                "action/resize",
                JSON.stringify({
                  id,
                  type,
                  parent: { id: parentId, type: parentType },
                })
              );
              e.dataTransfer.setData(`direction/${direction}`, "");
            } else {
              e.dataTransfer.setData("action/move", "");
            }
          }
        }}
        {...props}
      >
        {canResize ? (
          <>
            <div className="resize-handle top" tabIndex={1000} />
            <div className="resize-handle left" tabIndex={1000} />
            <div className="resize-handle bottom" tabIndex={1000} />
            <div className="resize-handle right" tabIndex={1000} />
            <div className="resize-handle top-left" tabIndex={1000} />
            <div className="resize-handle top-right" tabIndex={1000} />
            <div className="resize-handle bottom-left" tabIndex={1000} />
            <div className="resize-handle bottom-right" tabIndex={1000} />
          </>
        ) : null}
        {props.children}
      </div>
    );
  }
);
