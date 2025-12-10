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
import {
  BoardObjects,
  DragAction,
  DragOrigin,
  DragSignature,
  ResizeDirection,
} from "../../utils/enums/items";
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
      preview = false,
      onContextMenu,
      scale,
      offset,
      ...props
    }: {
      id: string;
      type: BoardObjects;
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
      parentType: BoardObjects;
      clickCallback?: (params?: any[]) => void;
      menuProps?: { [menuProp: string]: boolean };
      menuItems?: Element[];
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
    const handleSelect = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      force = false
    ) => {
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
          dispatch(
            updateSize.action({
              id,
              type,
              sX: bounds.width / scale,
              sY: bounds.height / scale,
            })
          );
          
          updatingSize.current = false;
        }
      }
    }
    // update info if out of date i guess
    updateSelectData();

    return (
      <div
        ref={nodeRef}
        id={id}
        data-selected={selected}
        onClick={(e) => {
          if (!selected) {
            handleSelect(e);
          }
        }}
        draggable={canPosition}
        className={`node ${type}${selected ? " selected" : ""}${
          !!className ? " " + className : ""
        }${dragging && !preview ? " dragging" : ""}`}
        style={{
          width: sX ? `${sX}px` : undefined,
          height: sY ? `${sY}px` : undefined,
          transform: `translate(${pX}px, ${pY}px)`,
        }}
        tabIndex={-1}
        onContextMenu={(e) => {
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
          if (!e.dataTransfer.types.includes(DragSignature)) {
            e.dataTransfer.setData(DragSignature, "");
            e.dataTransfer.setData(DragOrigin.BOARD, "");
            e.dataTransfer.setData(DragAction.MOVE, "");
          }
        }}
        {...props}
      >
        {canResize ? (
          <>
            {" "}
            <div
              className="resize-handle top"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.TOP, "");
              }}
            />
            <div
              className="resize-handle left"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.LEFT, "");
              }}
            />
            <div
              className="resize-handle bottom"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.BOTTOM, "");
              }}
            />
            <div
              className="resize-handle right"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.RIGHT, "");
              }}
            />
            <div
              className="resize-handle top-left"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.TOPLEFT, "");
              }}
            />
            <div
              className="resize-handle top-right"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.TOPRIGHT, "");
              }}
            />
            <div
              className="resize-handle bottom-left"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.BOTTOMLEFT, "");
              }}
            />
            <div
              className="resize-handle bottom-right"
              tabIndex={3}
              style={{ pointerEvents: "auto" }}
              draggable={!preview}
              onDragStart={(e) => {
                e.dataTransfer.setData(DragSignature, "");
                e.dataTransfer.setData(DragAction.RESIZE, "");
                e.dataTransfer.setData(ResizeDirection.BOTTOMRIGHT, "");
              }}
            />
          </>
        ) : null}
        {props.children}
      </div>
    );
  }
);
