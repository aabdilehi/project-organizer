import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { BoardObjects } from "../utils/enums/items";
import React from "react";
import {
  TbArrowLeft as IconArrowLeft,
  TbCheckbox as IconCheckbox,
  TbFileText as IconFileText,
  TbHome as IconHome,
  TbLayoutDashboard as IconLayoutDashboard,
  TbNote as IconNote,
  TbPhoto as IconPhoto,
  TbStack2 as IconStack2,
  TbDownload as IconExport,
  TbUpload as IconImport,
} from "react-icons/tb";
import { withRouter } from "./Modular/ComponentWithRouterProp";
import { useDispatch, useSelector } from "react-redux";
import { clearDragData, setDragData } from "../utils/slices/dragSlice";
import { formatData, NodeTypeMap } from "../utils/classes/new-classes";
import { v4 as uuidv4 } from "uuid";
import { ExportButton, ImportButton } from "./Modular/ExportButton";
import { Tooltip } from "./Modular/IconTooltip";

const Toolbar = ({ router, boardId, boardRef, scale, offset, parent }) => {
  const sideBarRef = useRef();

  const dispatch = useDispatch();

  const createNodeDragPreview = (event, type) => {
    if (!boardRef.current) return;
    const boundingRect = boardRef.current.getBoundingClientRect();
    dispatch(clearDragData());
    const node = formatData(
      {
        id: uuidv4(),
        pX: (event.clientX - boundingRect.left - offset.x) / scale,
        pY: (event.clientY - boundingRect.top - offset.y) / scale,
        parent: {
          id: boardId,
          type: BoardObjects.BOARD,
        },
      },
      NodeTypeMap[type]
    );
    dispatch(
      setDragData({
        initialPosition: {
          x: event.clientX,
          y: event.clientY,
        },
        nodes: { [node.id]: node },
        types: event.dataTransfer.types,
      })
    );
  };

  return (
    <div ref={sideBarRef} className="toolbar">
      <div>
        <TooltipWrapper name="Home" placement="right">
          <button
            type="button"
            className="toolbar-button"
            onClick={() => {
              router.navigate(`/`);
            }}
            disabled={!scale || boardId === "root"}
          >
            <IconHome size={18} />
          </button>
        </TooltipWrapper>
        <TooltipWrapper name="Import" placement="right">
          <ImportButton className="toolbar-button">
            <IconImport size={18} />
          </ImportButton>
        </TooltipWrapper>
        <TooltipWrapper name="Export" placement="right">
          <ExportButton className="toolbar-button">
            <IconExport size={18} />
          </ExportButton>
        </TooltipWrapper>

        <TooltipWrapper name="Back" placement="right">
          <button
            type="button"
            className="toolbar-button"
            onClick={() => {
              router.navigate(
                !Object.hasOwn(parent, "id") ||
                  (Object.hasOwn(parent, "type") &&
                    parent.type !== BoardObjects.BOARD)
                  ? `/`
                  : `/${parent.id}`
              );
            }}
            disabled={!parent}
          >
            <IconArrowLeft size={18} />
          </button>
        </TooltipWrapper>
      </div>
      <div>
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Board"
          type={BoardObjects.BOARD}
          icon={IconLayoutDashboard}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Note"
          type={BoardObjects.NOTE}
          icon={IconNote}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Document"
          type={BoardObjects.DOCUMENT}
          icon={IconFileText}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="To-do"
          type={BoardObjects.TASK}
          icon={IconCheckbox}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Group"
          type={BoardObjects.GROUP}
          icon={IconCheckbox}
        />
        <ToolbarObject
          onDragStart={(event, type) => createNodeDragPreview(event, type)}
          name="Image"
          type={BoardObjects.IMAGE}
          icon={IconPhoto}
        />
      </div>
    </div>
  );
};

const TooltipWrapper = ({
  name,
  children,
  placement = "right",
}: (
  | React.HTMLAttributes<HTMLDivElement>
  | React.ButtonHTMLAttributes<HTMLButtonElement>
) & {
  name: string;
  placement: string;
}) => {
  const [tooltipVisible, setToolTopVisible] = useState(false);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        position: "relative",
        height: "fit-content",
        width: "fit-content",
      }}
    >
      <span
        onMouseEnter={() => setToolTopVisible(true)}
        onMouseLeave={() => setToolTopVisible(false)}
      >
        {children}
      </span>
      {tooltipVisible && <Tooltip text={name} placement={"right"} />}
    </div>
  );
};

const ToolbarObject = ({ name, type, icon: Icon, onDragStart }) => {
  const ref = useRef(null);
  const handleDragStart = (event) => {
    // remove or hide drag preview image
    const prev = document.createElement("span");
    prev.style.display = "none";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setDragImage(prev, 0, 0);
    event.dataTransfer.setData("origin/toolbar", JSON.stringify({ type }));
    onDragStart(event, type);
  };

  return (
    <TooltipWrapper name={name} placement="right">
      <div
        className="toolbar-item"
        draggable
        onDragStart={handleDragStart}
        ref={ref}
      >
        <Icon size={18} />
      </div>
    </TooltipWrapper>
  );
};

export default withRouter(Toolbar);
