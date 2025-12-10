//#region Imports
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  BoardObjects,
  DragAction,
  DragOrigin,
  DragRenderLayers,
  DragSignature,
} from "../utils/enums/items.tsx";
import Note from "./Note.jsx";

import { useDrop } from "../utils/hooks/useDrop.jsx";
import { Router, withRouter } from "./Modular/ComponentWithRouterProp.jsx";
import { clearSelectNode } from "../utils/slices/selectionSlice.ts";
import BoardIcon from "./BoardIcon.jsx";
import Document from "./Document.jsx";
import Task from "./Task";
import { PreviewRenderLayer, useDragLogic } from "./DragLayer";
import { updateOffset, updateScale } from "../utils/slices/boardSlice.ts";
import ContextMenu from "../utils/hooks/ContextMenu.tsx";
import Group from "./Group.jsx";
import { RootState } from "../store.ts";
import ResizeMarquee from "./Modular/ResizeMarquee.tsx";
import Toolbar from "./Toolbar.tsx";
import Image from "./Image.js";
import { BoardType } from "../utils/classes/new-classes.ts";
import useBackground, {
  backgroundMap,
  Backgrounds,
  originalBackground,
} from "../utils/hooks/useBackground.ts";
import useTheme, { ThemeIcons, Themes } from "../utils/hooks/useTheme.ts";
import FloatingMenu from "./Modular/FloatingMenu.tsx";
import IconButton from "./Modular/IconButton.tsx";
import { TbSettings } from "react-icons/tb";
import { Modal } from "./Modular/Modal.tsx";
import AutoResizeTextArea from "./Modular/AutoResizeTextArea.tsx";
import { TooltipWrapper } from "./Modular/IconTooltip.tsx";
//#endregion

const Board = ({
  validBoard,
  router,
}: {
  validBoard: boolean;
  router: Router;
}) => {
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
    boardId == "root" ? undefined : (state.boards[boardId] as BoardType).parent
  );

  if (!scale || !offset) return;

  const { theme, setTheme } = useTheme();
  const { background, setBackground, updateBackground } = useBackground(offset, scale);
  const [open, setOpen] = useState(false);
  //#endregion

  //#region References
  const ref = useRef<HTMLDivElement>(null);
  const transformRef = useRef<HTMLDivElement>(null);
  let currentPosition = offset;
  let currentScale = scale;
  const currentMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);

  const [customBackground, setCustomBackground] = useState<string>("");
  //#endregion

  //#region Dispatch actions

  const dispatch = useDispatch();

  useDragLogic({
    boardId,
    boardRef: ref,
    transformRef,
    scale,
    offset,
  });

  useEffect(() => {
    dispatch(clearSelectNode());
    setBackground(originalBackground);
  }, [boardId]);

  //#endregion

  let wheelEventEndTimeout;

  let twoFingerPanTimeout: NodeJS.Timeout | null;

  const handleTwoFingerPan = (event: React.WheelEvent<HTMLDivElement>) => {
    if (twoFingerPanTimeout == null) {
    } else clearTimeout(twoFingerPanTimeout);

    if (transformRef.current != null && currentPosition != null) {
      currentPosition = {
        x: currentPosition.x - event.deltaX * 0.4,
        y: currentPosition.y - event.deltaY * 0.4,
      };

      requestAnimationFrame(() => {
        transformRef.current!.style.transform = `scale(${currentScale}) translate(${currentPosition.x / currentScale
          }px, ${currentPosition.y / currentScale}px)`;

        updateBackground(currentPosition, currentScale);
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
    }, 250);
  };

  let twoFingerZoomTimeout: NodeJS.Timeout | null;

  const handleTwoFingerZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    if (twoFingerZoomTimeout == null) {
      currentScale = scale;
    } else clearTimeout(twoFingerZoomTimeout);
    console.log(event.deltaY);
    if (transformRef.current != null && currentPosition != null) {
      const newScale = Math.max(
        0.05,
        currentScale + Math.min(10, Math.max(-10, event.deltaY)) * -0.0125
      );
      currentScale += (newScale - currentScale) * 0.2;

      requestAnimationFrame(() => {
        transformRef.current!.style.transform = `scale(${currentScale}) translate(${currentPosition.x / currentScale
          }px, ${currentPosition.y / currentScale}px)`;

        updateBackground(currentPosition, currentScale);
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

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // if (
    //   event.target === ref.current ||
    //   event.target.parentNode === ref.current
    // ) {
    if (event.ctrlKey) handleTwoFingerZoom(event);
    else handleTwoFingerPan(event);
    // }
  };

  const handleRightClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (!ref.current) return;
    const boundingRect = ref.current.getBoundingClientRect();
    const x = event.clientX - boundingRect.left;
    const y = event.clientY - boundingRect.top;
    // open context menu at mouse pos
    currentMousePos.current = { x, y };

    setContextMenuOpen(true);
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (event.type == "mousedown") {
      if (event.target !== ref.current && event.target !== transformRef.current)
        return;

      // Begin panning if user middle clicks on board
      if (event.button === 1) {
        event.preventDefault();
        const startX = event.pageX - offset.x;
        const startY = event.pageY - offset.y;
        const handleMouseMove = (event: MouseEvent) => {
          event.preventDefault();
          if (transformRef.current !== null && currentPosition !== null) {
            currentPosition = {
              x: event.pageX - startX,
              y: event.pageY - startY,
            };

            requestAnimationFrame(() => {
              transformRef.current!.style.transform = `scale(${currentScale}) translate(${currentPosition.x / currentScale
                }px, ${currentPosition.y / currentScale}px)`;
            updateBackground(currentPosition, currentScale);
            });
          }
        };

        const handleMouseUp = (event: MouseEvent) => {
          // Clear selection if user left clicks on board
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

  const calculateRelativePosition = (x: number, y: number) => {
    if (!ref.current) return;
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

  const [customBackgroundModalOpen, setCustomBackgroundModalOpen] = useState(false);

  //#region Render board
  return (
    <>
      <PreviewRenderLayer
        layer={DragRenderLayers.BOTTOM}
        boardId={boardId}
        boardRef={ref}
        transformRef={transformRef}
        scale={currentScale}
        offset={currentPosition}
      />
      <div
        ref={ref}
        draggable={true}
        className="actualboard"
        onMouseDown={(event) => handleMouseDown(event)}
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
        onDragStart={(event: any) => {
          if (event.dataTransfer.types.includes(DragSignature)) return;
          event.dataTransfer.setData(DragSignature, "");
          event.dataTransfer.setData(DragOrigin.BOARD, "");
          event.dataTransfer.setData(DragAction.SELECT, "");
        }}
        onDrop={(event) => {
          event.stopPropagation();
          dropOnBoard(event, boardId);
        }}
        onDragOver={(event) => {
          allowDropOnBoard(event);
        }}
      >
        <Toolbar
          id={boardId}
          boardRef={ref}
          scale={currentScale}
          offset={currentPosition}
          parent={parent}
        />
        <ContextMenu
          boardId={boardId}
          open={contextMenuOpen}
          setOpen={openContextMenu}
          mousePosition={currentMousePos}
        />

        <div
          style={{
            position: "absolute",
            zIndex: 3,
            right: "12px",
            top: "12px",
          }}
        >
          <TooltipWrapper name="Change theme" placement="left">
            <IconButton
              id="theme-button"
              icon={ThemeIcons[theme]}
              iconProps={{ size: 20 }}
              onClick={() => {
                setOpen(true);
              }}
              style={{
                height: "30px",
                width: "30px",
                borderRadius: "6px",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </TooltipWrapper>
          <FloatingMenu className="context-menu" open={open} setOpen={setOpen} style={{
            position: "absolute",
            transform: "translate(-100%, 5px)",
            left: "100%",

          }}>
            {/* Theme picker */}
            <div className="context-menu-group">
              <p>Themes</p>
              {Object.keys(Themes).map((key) => <div
                className={`context-menu-item${Themes[key] == theme ? " selected" : ""}`}
                onClick={(event) => {
                  setTheme(Themes[key])
                  setOpen(false);
                }}
              >
                <p>{key}</p>
              </div>)}
            </div>
            {/* Background patterns */}
            <div className="context-menu-group">
              <p>Backgrounds</p>
              {Object.keys(Backgrounds).map(key => <div
                className={`context-menu-item${backgroundMap[Backgrounds[key]] == background ? " selected" : ""}`}
                onClick={(event) => {
                  setBackground(Backgrounds[key] == Backgrounds.CUSTOM ? customBackground : backgroundMap[Backgrounds[key]])
                  setOpen(false);
                }}
              >
                <p>{key}</p>
                {Backgrounds[key] == Backgrounds.CUSTOM ? <IconButton icon={TbSettings} style={{padding: "1px", borderRadius: "0.175rem"}} iconProps={{ size: 18 }} onClick={(event) => { event.stopPropagation(); setCustomBackgroundModalOpen(true); }} /> : null}
              </div>)}
            </div>
            {/* Colour pickers */}
          </FloatingMenu>
        </div>

        <Modal open={customBackgroundModalOpen} setOpen={setCustomBackgroundModalOpen}>
            <label htmlFor="background-image">Pattern:</label>
            <AutoResizeTextArea name="background-image" />
        </Modal>

        <div
          ref={transformRef}
          className="board-transform"
          style={{
            transform: `scale(${currentScale}) translate(${currentPosition.x / currentScale
              }px, ${currentPosition.y / currentScale}px)`,
          }}
        >
          <ResizeMarquee
            active={true}
            scale={currentScale}
            offset={currentPosition}
          />
          {childRefs.map(({ id, type }) => {
            switch (type) {
              case BoardObjects.NOTE:
                return (
                  <Note
                    key={id}
                    id={id}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.TASK:
                return (
                  <Task
                    key={id}
                    id={id}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.GROUP:
                return (
                  <Group
                    key={id}
                    id={id}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.BOARD:
                return (
                  <BoardIcon
                    key={id}
                    id={id}
                    drop={dropOnBoard}
                    allowDrop={allowDropOnBoard}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.DOCUMENT:
                return (
                  <Document
                    key={id}
                    id={id}
                    onContextMenu={handleRightClick}
                    scale={currentScale}
                    offset={currentPosition}
                  />
                );
              case BoardObjects.IMAGE:
                return (
                  <Image key={id} id={id} onContextMenu={handleRightClick} />
                );
              default:
                break;
            }
          })}
        </div>
      </div>
      <PreviewRenderLayer
        layer={DragRenderLayers.TOP}
        boardId={boardId}
        boardRef={ref}
        transformRef={transformRef}
        scale={currentScale}
        offset={currentPosition}
      />
    </>
  );

  //#endregion
};

export default withRouter(Board);
