import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ContextMenuItem,
  NewNodeMenuItem,
  reduceContextMenu,
} from "../context-menu-types";
import React from "react";
import ReactDOM from "react-dom";
import { StoreState } from "../enums/state-type";
import {
  copySelection,
  deleteSelection,
  pasteToSelectedNodes,
} from "../node-helper-functions";

export function useContextMenu({ boardId, containerRef, calculatePosition }) {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const selectedNodes = useSelector((state: StoreState) => state.selection);
  const contextMenu = useSelector((state: StoreState) => {
    const types = Object.values(state.selection).map((node) => node.type);
    return reduceContextMenu(types);
  });

  const handleRightClick = (event) => {
    event.preventDefault();
    const boundingRect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;
    // open context menu at mouse pos
    setMousePos({ x: mouseX, y: mouseY });

    setIsOpen(true);
  };

  const ContextMenu = () => {
    const contextRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
      const handleClick = (e) => {
        if (
          e.currentTarget !== contextRef.current ||
          e.currentTarget.parentNode !== contextRef.current
        ) {
          setIsOpen(false);
        }
      };
      window.addEventListener("click", handleClick);
      return () => {
        window.removeEventListener("click", handleClick);
      };
    }, []);

    return isOpen
      ? ReactDOM.createPortal(
          <div
            className="context-menu"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
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
                      const { x, y } = calculatePosition(
                        mousePos.x,
                        mousePos.y
                      );
                      copySelection(boardId, x, y);
                    }}
                  >
                    Copy
                  </div>
                ) : null}
                {contextMenu.canDelete ? (
                  <div className="context-menu-item" onClick={deleteSelection}>
                    Delete
                  </div>
                ) : null}
                {contextMenu.canPaste ? (
                  <div
                    className="context-menu-item"
                    onClick={(event) => {
                      const { x, y } = calculatePosition(
                        mousePos.x,
                        mousePos.y
                      );
                      pasteToSelectedNodes(boardId, x, y);
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
                        onClick={() =>
                          item.onClick &&
                          item.onClick(boardId, mousePos.x, mousePos.y)
                        }
                      >
                        {item.label}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>,
          document.querySelector("#root")
        )
      : undefined;
  };

  return {
    handleRightClick,
    ContextMenu,
  };
}
