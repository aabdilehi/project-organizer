import React, {
  forwardRef,
  LegacyRef,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  addSelectNode,
  selectNode,
  toggleSelectNode,
} from "../../utils/slices/selectionSlice";
import { connect, useDispatch, useSelector } from "react-redux";
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
      selected,
      dragging,
      handleSelect,
      updateSelectData,
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
      selected: boolean;
      dragging: boolean;
      handleSelect: React.MouseEventHandler<HTMLDivElement>;
      updateSelectData: () => void;
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

    // update info if out of date i guess
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

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;

  return {
    selected: state.selection.hasOwnProperty(id),
    selectData: state.selection,
    dragging: state.drag.nodes.hasOwnProperty(id),
    isInColumn:
      (!ownProps.preview && ownProps.parent.type === BoardObjects.COLUMN) ||
      (ownProps.preview && ownProps.isInColumn),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleSelect: (event) => {
      if (event.shiftKey) {
        dispatch(
          addSelectNode({
            id: ownProps.id,
            type: ownProps.type,
            parent: ownProps.parent,
          })
        );
        return;
      } else if (event.ctrlKey) {
        dispatch(
          toggleSelectNode({
            id: ownProps.id,
            type: ownProps.type,
            parent: ownProps.parent,
          })
        );
        return;
      } else {
        dispatch(
          selectNode({
            id: ownProps.id,
            type: ownProps.type,
            parent: ownProps.parent,
          })
        );
        return;
      }
    },
    updateSelectData: (selected, selectData) => {
      if (!selected) return;

      // check parent data exists
      if (!selectData[ownProps.id].hasOwnProperty("parent")) return;

      // check parent data is consistent
      if (
        selectData[ownProps.id].parent.id == ownProps.parent.id &&
        selectData[ownProps.id].parent.type == ownProps.parent.type
      )
        return;
      dispatch(
        addSelectNode({
          id: ownProps.id,
          type: ownProps.type,
          parent: ownProps.parent,
        })
      );
    },
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...stateProps,
    handleSelect: dispatchProps.handleSelect,
    updateSelectData: () => {
      dispatchProps.updateSelectData(
        stateProps.selected,
        stateProps.selectData
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(NodeWrapper);
