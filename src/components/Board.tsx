//#region Imports
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { connect, useDispatch, useSelector } from "react-redux";

import { BoardObjects } from "../utils/enums/items.tsx";
import Note from "./Note.jsx";

import {
  addChild,
  addNode,
  removeChild,
  removeNode,
} from "../utils/slices/nodeActions.ts";

import { useDrop } from "../utils/hooks/useDrop.jsx";
import { withRouter } from "./Modular/ComponentWithRouterProp.jsx";
import { clearSelectNode } from "../utils/slices/selectionSlice.ts";
import BoardIcon from "./BoardIcon.jsx";
import Document from "./Document.jsx";
import Task from "./Task";
import DragLayer from "./DragLayer.tsx";
import { updateOffset, updateScale } from "../utils/slices/boardSlice.ts";
import {
  addCopyNode,
  clearCopiedNodes,
  setPosition,
} from "../utils/slices/copiedSlice.ts";
import ContextMenu from "../utils/hooks/ContextMenu.tsx";
import Group from "./Group.jsx";
import {
  selectCopiedNodes,
  selectCopiedPosition,
  selectNodes,
  selectSelection,
} from "../utils/slices/selectors.ts";
import { RootState } from "../store.ts";
import ResizeMarquee from "./Modular/ResizeMarquee.tsx";
import Toolbar from "./Toolbar.tsx";
import Image from "./Image.jsx";
//#endregion

const setOriginalBackground = (
  element: HTMLDivElement,
  position: { x: number; y: number },
  scale: number
) => {
  element.style.background = originalBackground;
  element.style.backgroundPosition = originalBackgroundPosition(
    position,
    scale
  );
  element.style.backgroundSize = originalBackgroundSize(scale);
};

const originalBackground = `radial-gradient(
    circle,
    var(--secondary-background-color) 1px,
    var(--primary-background-color) 2px
  )`;
const originalBackgroundSize = (scale) => {
  return `${50 * scale}px ${50 * scale}px`;
};
const originalBackgroundPosition = (position, scale) => {
  return `${position.x}px ${position.y}px`;
};

const setCrossBackground = (
  element: HTMLDivElement,
  position: { x: number; y: number },
  scale: number
) => {
  element.style.background = crossBackground;
  element.style.backgroundPosition = crossBackgroundPosition(position, scale);
  element.style.backgroundSize = crossBackgroundSize(scale);
};

const crossBackground = `radial-gradient(circle, transparent 20%, slategray 20%,
    slategray 80%, transparent 80%, transparent),
  radial-gradient(circle, transparent 20%, slategray 20%,
    slategray 80%, transparent 80%, transparent) 50px 50px,
  linear-gradient(#A8B1BB 8px, transparent 8px) 0 -4px,
  linear-gradient(90deg, #A8B1BB 8px, transparent 8px) -4px 0`;
const crossBackgroundPosition = (position, scale) => {
  return `${position.x}px ${position.y}px,${position.x + 50 * scale}px ${
    position.y + 50 * scale
  }px,${position.x}px ${position.y - 4 * scale}px,${position.x - 4 * scale}px ${
    position.y
  }px`;
};

const crossBackgroundSize = (scale) => {
  const size1 = 100 * scale;
  const size2 = 50 * scale;
  return `${size1}px ${size1}px, ${size1}px ${size1}px, ${size2}px ${size2}px, ${size2}px ${size2}px`;
};

const setWaveBackground = (
  element: HTMLDivElement,
  position: { x: number; y: number },
  scale: number
) => {
  element.style.background = waveBackground;
  element.style.backgroundSize = waveBackgroundSize(scale);
  element.style.backgroundPosition = waveBackgroundPosition(position, scale);
};

const waveBackground = `radial-gradient(
      circle at 100% 50%,
      transparent 20%,
      var(--secondary-background-color) 21%,
      var(--secondary-background-color) 34%,
      transparent 35%,
      transparent
    ),
    radial-gradient(
        circle at 0% 50%,
        transparent 20%,
        var(--secondary-background-color) 21%,
        var(--secondary-background-color) 34%,
        transparent 35%,
        transparent
      )
      `;

const waveBackgroundSize = (scale) => {
  return `${75 * scale}px ${100 * scale}px`;
};

const waveBackgroundPosition = (position, scale) => {
  return `${position.x}px ${position.y}px, ${position.x}px ${
    position.y - 50 * scale
  }px`;
};

const Board = ({ validBoard, router }) => {
  //#region Handle initial page setup
  const { id } = router.params;
  const boardId = id ? id : "root";

  //#region Selectors

  const scale = useSelector((state: RootState) => state.boards[boardId].scale);
  const offset = useSelector(
    (state: RootState) => state.boards[boardId].offset
  );
  const childRefs = useSelector(
    (state: RootState) => state.boards[boardId].childRefs
  );

  const parent = useSelector((state: RootState) =>
    boardId == "root" ? undefined : state.boards[boardId].parent
  );

  const shouldAnimateResizeMarquee = useRef(false);

  const nodes = useSelector(selectNodes);

  if (!scale || !offset) return;

  const selectedNodes = useSelector(selectSelection);
  const copiedNodes = useSelector(selectCopiedNodes);
  const copiedPosition = useSelector(selectCopiedPosition);

  //#endregion

  //#region References
  const ref = useRef();
  const transformRef = useRef();
  let currentPosition = offset;
  let currentScale = scale;
  const currentMousePos = useRef({ x: 0, y: 0 });
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  //#endregion

  //#region Dispatch actions

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearSelectNode());
  }, [boardId]);

  //#endregion

  let wheelEventEndTimeout;

  let twoFingerPanTimeout: NodeJS.Timeout | null;

  const handleTwoFingerPan = (event: WheelEvent) => {
    if (twoFingerPanTimeout == null) {
      shouldAnimateResizeMarquee.current = true;
    } else clearTimeout(twoFingerPanTimeout);

    if (transformRef.current != null && currentPosition != null) {
      currentPosition = {
        x: currentPosition.x - event.deltaX * 0.4,
        y: currentPosition.y - event.deltaY * 0.4,
      };

      requestAnimationFrame(() => {
        transformRef.current.style.transform = `scale(${currentScale}) translate(${
          currentPosition.x / currentScale
        }px, ${currentPosition.y / currentScale}px)`;

        setOriginalBackground(ref.current, currentPosition, currentScale);
      });
    }

    twoFingerPanTimeout = setTimeout(() => {
      dispatch(
        updateOffset({
          id: boardId,
          x: currentPosition.x,
          y: currentPosition.y,
        })
      );
      twoFingerPanTimeout = null;
      shouldAnimateResizeMarquee.current = false;
    }, 250);
  };

  let twoFingerZoomTimeout: NodeJS.Timeout | null;

  const handleTwoFingerZoom = (event: WheelEvent) => {
    if (twoFingerZoomTimeout == null) {
      currentScale = scale;
      shouldAnimateResizeMarquee.current = true;
    } else clearTimeout(twoFingerZoomTimeout);
    console.log(event.deltaY);
    if (transformRef.current != null && currentPosition != null) {
      const newScale = Math.max(
        0.05,
        currentScale + Math.min(10, Math.max(-10, event.deltaY)) * -0.0125
      );
      currentScale += (newScale - currentScale) * 0.2;

      requestAnimationFrame(() => {
        transformRef.current.style.transform = `scale(${currentScale}) translate(${
          currentPosition.x / currentScale
        }px, ${currentPosition.y / currentScale}px)`;

        setOriginalBackground(ref.current, currentPosition, currentScale);
        // This should be changed as you cannot pan and scale at the same time rn
      });
    }

    twoFingerZoomTimeout = setTimeout(() => {
      dispatch(
        updateScale({
          id: boardId,
          scale: currentScale,
        })
      );
      twoFingerZoomTimeout = null;
    }, 250);
  };

  const handleWheel = (event: WheelEvent) => {
    // if (
    //   event.target === ref.current ||
    //   event.target.parentNode === ref.current
    // ) {
    if (event.ctrlKey) handleTwoFingerZoom(event);
    else handleTwoFingerPan(event);
    // }
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    const boundingRect = ref.current.getBoundingClientRect();
    const x = event.clientX - boundingRect.left;
    const y = event.clientY - boundingRect.top;
    // open context menu at mouse pos
    currentMousePos.current = { x, y };

    setContextMenuOpen(true);
  };

  const handleMouseDown = (event) => {
    if (event.type == "mousedown") {
      if (event.target !== ref.current && event.target !== transformRef.current)
        return;

      // Begin panning if user middle clicks on board
      if (event.button === 1) {
        event.preventDefault();
        const startX = event.pageX - offset.x;
        const startY = event.pageY - offset.y;
        shouldAnimateResizeMarquee.current = true;
        const handleMouseMove = (event) => {
          event.preventDefault();
          if (transformRef.current !== null && currentPosition !== null) {
            currentPosition = {
              x: event.pageX - startX,
              y: event.pageY - startY,
            };

            requestAnimationFrame(() => {
              transformRef.current.style.transform = `scale(${currentScale}) translate(${
                currentPosition.x / currentScale
              }px, ${currentPosition.y / currentScale}px)`;

              setOriginalBackground(ref.current, currentPosition, currentScale);
            });
          }
        };

        const handleMouseUp = (event) => {
          // Clear selection if user left clicks on board
          shouldAnimateResizeMarquee.current = false;
          // if (event.button === 0) {
          //   dispatch(clearSelectNode());
          // }
          dispatch(
            updateOffset({
              id: boardId,
              x: event.pageX - startX,
              y: event.pageY - startY,
            })
          );
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }
      return;
    }
  };

  const calculateRelativePosition = (x, y) => {
    const boundingRect = ref.current.getBoundingClientRect();
    const xCoord = (x - boundingRect.left - offset.x) / scale;
    const yCoord = (y - boundingRect.top - offset.y) / scale;

    return {
      x: xCoord,
      y: yCoord,
    };
  };

  //#endregion

  //#region Drop behaviour
  const { dropOnBoard, allowDropOnBoard } = useDrop({
    boardRef: ref,
    scale: currentScale,
    offset: currentPosition,
  });
  //#endregion

  function openContextMenu(open: boolean) {
    setContextMenuOpen(open);
  }

  //#region Render board
  return (
    <>
      <div
        ref={ref}
        draggable={true}
        className="actualboard"
        onMouseDown={(event) => handleMouseDown(event)}
        style={{
          background: originalBackground,
          backgroundSize: originalBackgroundSize(scale),
          backgroundPosition: originalBackgroundPosition(offset, scale),
        }}
        onWheel={(event) => handleWheel(event)}
        onClick={(e) => {
          if (
            e.target == transformRef.current ||
            (e.target == ref.current && !e.shiftKey && !e.ctrlKey)
          ) {
            dispatch(clearSelectNode());
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (e.target == transformRef.current || e.target == ref.current) {
            dispatch(clearSelectNode());
          }
          handleRightClick(e);
        }}
        onDragStart={(event) => {
          if (event.dataTransfer.types.length > 0) return;
          event.dataTransfer.setData("origin/board", "");
          event.dataTransfer.setData("action/select", "");
        }}
        onDrop={(event) => {
          event.stopPropagation();
          dropOnBoard(event, boardId);
        }}
        onDragOver={(event) => {
          allowDropOnBoard(event);
        }}
        onResize={(e) => e.preventDefault()}
      >
        <Toolbar
          id={boardId}
          boardRef={ref}
          scale={currentScale}
          offset={currentPosition}
          parent={parent}
        />
        <DragLayer
          boardId={boardId}
          boardRef={ref}
          transformRef={transformRef}
          scale={currentScale}
          offset={currentPosition}
        />
        <ContextMenu
          boardId={boardId}
          open={contextMenuOpen}
          setOpen={openContextMenu}
          mousePosition={currentMousePos}
          calculatePosition={calculateRelativePosition}
        />
        {/* <ResizeMarquee scale={currentScale} offset={currentPosition} /> */}
        <div
          ref={transformRef}
          className="board-transform"
          style={{
            transform: `scale(${currentScale}) translate(${
              currentPosition.x / currentScale
            }px, ${currentPosition.y / currentScale}px)`,
          }}
        >
          <ResizeMarquee scale={currentScale} offset={currentPosition} />
          {childRefs.map(({ childId, childType }) => {
            switch (childType) {
              case BoardObjects.NOTE:
                return (
                  <Note
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.TASK:
                return (
                  <Task
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.GROUP:
                return (
                  <Group
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.BOARD:
                return (
                  <BoardIcon
                    key={childId}
                    id={childId}
                    drop={dropOnBoard}
                    allowDrop={allowDropOnBoard}
                    onContextMenu={handleRightClick}
                  />
                );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.IMAGE:
                return (
                  <Image
                    key={childId}
                    id={childId}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              default:
                break;
            }
          })}
        </div>
      </div>
    </>
  );

  //#endregion
};

export default withRouter(Board);
