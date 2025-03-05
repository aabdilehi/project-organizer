import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ContextMenuItem,
  groupItemsThunk,
  reduceContextMenu,
} from "../context-menu-types";
import React from "react";
import ReactDOM from "react-dom";
import {
  deleteSelection,
  copySelection,
  pasteCopiedNodes,
} from "../slices/thunks";
import { selectSelection } from "../slices/selectors";
import { createSelector } from "@reduxjs/toolkit";

const selectedNodeTypes = createSelector([selectSelection], (selectedNodes) =>
  reduceContextMenu(Object.values(selectedNodes).map((node) => node.type))
);

const ContextMenu = ({
  boardId,
  mousePosition,
  open,
  setOpen,
  calculatePosition,
}) => {
  const contextRef = useRef();
  const selectedNodes = useSelector(selectSelection);
  const contextMenu = useSelector(selectedNodeTypes);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClick = (e) => {
      if (
        e.target != contextRef.current &&
        e.target.parentNode != contextRef.current &&
        e.target.parentNode.parentNode != contextRef.current
      ) {
        console.log(e);
        setOpen(false);
      }
    };
    window.addEventListener("mouseup", handleClick);
    return () => {
      window.removeEventListener("mouseup", handleClick);
    };
  }, []);

  return open
    ? ReactDOM.createPortal(
        <div
          className="context-menu"
          style={{
            left: `${mousePosition.current.x}px`,
            top: `${mousePosition.current.y}px`,
            transform: `translatex(50%)`, // reposition based on bounds
          }}
          ref={contextRef}
        >
          {contextMenu.canCopy ||
          contextMenu.canCut ||
          contextMenu.canDelete ||
          contextMenu.canPaste ? (
            <div className="context-menu-group">
              <p>Standard Node Actions</p>
              {contextMenu.canCut ? (
                <div className="context-menu-item">Cut</div>
              ) : null}
              {contextMenu.canCopy ? (
                <div
                  className="context-menu-item"
                  onClick={(event) => {
                    dispatch(
                      copySelection(boardId, event.clientX, event.clientY)
                    );
                    setOpen(false);
                  }}
                >
                  Copy
                </div>
              ) : null}
              {contextMenu.canDelete ? (
                <div
                  className="context-menu-item"
                  onClick={() => {
                    dispatch(deleteSelection());

                    setOpen(false);
                  }}
                >
                  Delete
                </div>
              ) : null}
              {contextMenu.canPaste ? (
                <div
                  className="context-menu-item"
                  onClick={(event) => {
                    dispatch(
                      pasteCopiedNodes(boardId, event.clientX, event.clientY)
                    );
                    setOpen(false);
                  }}
                >
                  Paste
                </div>
              ) : null}
            </div>
          ) : null}
          {contextMenu.items.length > 0 && (
            <div className="context-menu-group">
              <p>Exclusive Node Actions</p>
              {contextMenu.items.map(
                (item: ContextMenuItem | NewNodeMenuItem) => {
                  return (
                    <div
                      className="context-menu-item"
                      onClick={() => {
                        item.onClick &&
                          item.onClick(
                            dispatch,
                            boardId,
                            mousePosition.current.x,
                            mousePosition.current.y
                          );
                        setOpen(false);
                      }}
                    >
                      {item.label}
                    </div>
                  );
                }
              )}
            </div>
          )}
          {Object.values(selectedNodes).length > 1 && (
            <div className="context-menu-group">
              <p>Multiple Node Actions</p>
              <div
                className="context-menu-item"
                onClick={() => {
                  dispatch(groupItemsThunk(boardId));

                  setOpen(false);
                }}
              >
                Group selected items
              </div>
            </div>
          )}
        </div>,
        document.querySelector("#root")
      )
    : undefined;
};

export default ContextMenu;
