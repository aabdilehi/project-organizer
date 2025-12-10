import { RefObject, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ContextMenuItem,
  groupItemsThunk,
  reduceContextMenu,
} from "../context-menu-types";
import React from "react";
import {
  deleteSelection,
  copySelectionThunk,
  pasteCopiedNodesThunk,
} from "../slices/thunks";
import { selectSelection } from "../slices/selectors";
import { createSelector } from "@reduxjs/toolkit";
import FloatingMenu from "../../components/Modular/FloatingMenu";

const selectedNodeTypes = createSelector([selectSelection], (selectedNodes) =>
  reduceContextMenu(Object.values(selectedNodes).map((node) => node.type))
);

const ContextMenu = ({
  boardId,
  mousePosition,
  open,
  setOpen,
}: {
  boardId: string;
  mousePosition: RefObject<{ x: number; y: number }>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const selectedNodes = useSelector(selectSelection);
  const contextMenu = useSelector(selectedNodeTypes);
  const dispatch = useDispatch<any>();

  return  <FloatingMenu
          className="context-menu"
          open={open}
          setOpen={setOpen}
          style={{
            left:mousePosition.current?.x,
            top: mousePosition.current?.y,
          }}
        >
          {contextMenu.canCopy ||
          contextMenu.canCut ||
          contextMenu.canDelete ||
          contextMenu.canPaste ? (
            <div className="context-menu-group">
              <p>General actions</p>
              {contextMenu.canCut ? (
                <div className="context-menu-item"><p>Cut</p></div>
              ) : null}
              {contextMenu.canCopy ? (
                <div
                  className="context-menu-item"
                  onClick={(event) => {
                    dispatch(
                      copySelectionThunk(boardId, event.clientX, event.clientY)
                    );
                    setOpen(false);
                  }}
                >
                   <p>Copy</p>
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
                   <p>Delete</p>
                </div>
              ) : null}
              {contextMenu.canPaste ? (
                <div
                  className="context-menu-item"
                  onClick={(event) => {
                    dispatch(
                      pasteCopiedNodesThunk(
                        boardId,
                        event.clientX,
                        event.clientY
                      )
                    );
                    setOpen(false);
                  }}
                >
                   <p>Paste</p>
                </div>
              ) : null}
            </div>
          ) : null}
          {contextMenu.items.length > 0 && (
            <div className="context-menu-group">
              <p>Special actions</p>
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
                      <p>{item.label}</p>
                    </div>
                  );
                }
              )}
            </div>
          )}
          {Object.values(selectedNodes).length > 1 && (
            <div className="context-menu-group">
              <p>Group Actions</p>
              <div
                className="context-menu-item"
                onClick={() => {
                  dispatch(groupItemsThunk(boardId));

                  setOpen(false);
                }}
              >
                <p>Group selected items</p>
              </div>
            </div>
          )}
        </FloatingMenu>
};

export default ContextMenu;
