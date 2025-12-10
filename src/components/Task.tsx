/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TbCheck, TbEdit, TbPlus, TbX } from "react-icons/tb";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import {
  updateContent,
  updateSize,
  updateTitle,
} from "../utils/slices/nodeActions.ts";
import { Modal } from "./Modular/Modal.tsx";
import {
  setBadges,
  setSubTasks,
  updateTaskStatus,
} from "../utils/slices/taskSlice.ts";
import { BadgeEdit, BadgePreview } from "./Modular/Badge.tsx";
import AutoResizeTextArea from "./Modular/AutoResizeTextArea.tsx";
import IconButton from "./Modular/IconButton.tsx";
import {
  BadgeType,
  createBadge,
  createSubTask,
  SubTaskType,
} from "../utils/classes/new-classes.ts";
import { PlainRootState } from "../utils/slices/types.ts";

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};

const Task = ({
  id,
  onContextMenu,
  scale,
  offset,
}: {
  id: string;
  onContextMenu: React.MouseEventHandler<HTMLDivElement>;
  scale: number;
  offset: { x: number; y: number };
}) => {
  const dispatch = useDispatch();
  const nodeRef = useRef<HTMLDivElement>(null);
  const checkBoxRef = useRef<HTMLInputElement>(null); // React does not seem to support the indeterminate property so we have to set it manually
  const task = useSelector((state: PlainRootState) => state.tasks[id]);

  if (!task) return;
  const {
    pX,
    pY,
    sX,
    sY,
    content,
    title,
    status,
    indeterminate,
    badges,
    subTasks,
    parent,
  } = task;
  if (!parent) return null;

  const updateSizeFromElement = () => {
    if (nodeRef.current != null) {
      nodeRef.current.style.height = "unset";
      const bounds = nodeRef.current.getBoundingClientRect();
      if (
        Math.abs(sY - bounds.height / scale) > 10 // Padding is 10 on each side
      ) {
        dispatch(
          updateSize.action({
            id,
            type: BoardObjects.TASK,
            sX: bounds.width / scale,
            sY: bounds.height / scale,
          })
        );
      }
        nodeRef.current.style.height = sY + "px";
    }
  };

  if (checkBoxRef.current) {
    checkBoxRef.current.indeterminate = indeterminate;
  }

  const [open, setOpen] = useState(false);
  const taskTitleRef = useRef(null);
  const taskSummaryRef = useRef(null);
  const [tempBadges, setTempBadges] = useState<{
    [badgeId: string]: BadgeType;
  }>(badges);
  const [tempSubTasks, setTempSubTasks] = useState<{
    [subTaskId: string]: SubTaskType;
  }>(subTasks);

  const selected = useSelector((state: PlainRootState) =>
    Object.hasOwn(state.selection, id)
  );
  return (
    <>
      <NodeWrapper
        ref={nodeRef}
        id={id}
        type={BoardObjects.TASK}
        canPosition={true}
        canResize={false}
        pX={pX}
        pY={pY}
        sX={sX}
        sY={sY}
        parentId={parent.id}
        parentType={parent.type}
        scale={scale}
        offset={offset}
        onContextMenu={onContextMenu}
      >
        <input
          type="checkbox"
          ref={checkBoxRef}
          style={{
            gridArea: "checkbox",
            height: "25px",
            width: "25px",
            alignSelf: "center",
          }}
          checked={status}
          onChange={(e) => {
            dispatch(
              updateTaskStatus({
                taskId: id,
                status: e.target.checked,
                indeterminate: false,
              })
            );
          }}
        />
        <CustomEditablePreview
          as={"p"}
          style={{ gridArea: "title", width: "100%" }}
          canEdit={selected}
          text={title}
          textStyle={previewStyle}
          onChange={(value) => {
            dispatch(
              updateTitle.action({
                id,
                type: BoardObjects.TASK,
                title: value,
              })
            );
            updateSizeFromElement();
          }}
          onImmediateChange={updateSizeFromElement}
        />
        <IconButton
          style={{
            gridArea: "edit",
            height: "25px",
            width: "25px",
            borderRadius: "6px",
            alignItems: "center",
            justifyContent: "center",
          }}
          icon={TbEdit}
          onClick={() => {
            setTempBadges(badges);
            setTempSubTasks(subTasks);
            setOpen(true);
          }}
        />

        {Object.values(badges).length > 0 ? (
          <div
            style={{
              gridArea: "badges",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "2px",
              marginTop: "5px",
            }}
          >
            {Object.values(badges).map((badge) => (
              <BadgePreview
                id={badge.id}
                text={badge.text}
                colour={badge.color}
              />
            ))}
          </div>
        ) : undefined}
        <Modal
          open={open}
          setOpen={(boolean) => setOpen(boolean)}
          bodyStyle={{
            display: "flex",
            width: "450px",
            flexDirection: "column",
            gap: "15px",
            padding: "20px",
            boxSizing: "border-box",
            fontSize: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <label htmlFor="task-title">Title:</label>
            <input
              name="task-title"
              ref={taskTitleRef}
              type="text"
              defaultValue={title}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <label htmlFor="task-summary">
              <p>Summary:</p>
            </label>

            <AutoResizeTextArea
              ref={taskSummaryRef}
              name="task-summary"
              defaultValue={content}
              style={{
                lineHeight: "1.375",
                maxHeight: "calc(1.375rem * 6 + 16px)",
                resize: "none",
                width: "100%",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <p>Sub-tasks</p>
            {Object.values(tempSubTasks).length > 0
              ? Object.values(tempSubTasks).map((subTask, index) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      height: "fit-content",
                      padding: "10px",
                      backgroundColor: "var(--dark-main)",
                      borderRadius: "10px",
                      alignContent: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        gridArea: "checkbox",
                        translate: "0px -50%",
                        marginTop: "calc(0.6875rem + 8px)",
                      }}
                      checked={subTask.status}
                      onChange={(e) => {
                        const copy = {
                          ...tempSubTasks,
                          [subTask.id]: {
                            ...subTask,
                            status: e.target.checked,
                          },
                        };
                        setTempSubTasks(copy);
                      }}
                    />
                    <AutoResizeTextArea
                      name={`subTask-${index}`}
                      defaultValue={subTask.text}
                      onChange={(e) => {
                        const copy = {
                          ...tempSubTasks,
                          [subTask.id]: {
                            ...subTask,
                            text: e.target.value,
                          },
                        };
                        setTempSubTasks(copy);
                      }}
                      style={{
                        width: "70%",
                        flex: "1 1",
                        padding: "8px",
                        appearance: "none",
                        boxSizing: "border-box",
                        border: "1px grey",
                        lineHeight: "1.375rem",
                        minHeight: "calc(1.375rem + 16px)",
                        borderRadius: "0.375rem",
                        fontSize: "inherit",
                        resize: "none",
                        maxHeight: "calc(1.375rem * 4 + 16px)",
                        backgroundColor: "rgb(var(--primary-color))",
                        outline: " 1px solid rgba(255, 219, 128, 0.3)",
                        boxShadow:
                          "inset 0px 0px 12px -8px rgba(20, 20, 20, 0.4)",
                        color: "rgb(var(--secondary-color))",
                      }}
                    />
                    <IconButton
                      icon={TbX}
                      iconProps={{ size: 18 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "25px",
                        height: "25px",
                        borderRadius: "0.375rem",
                        translate: "0px -50%",
                        marginTop: "calc(0.6875rem + 8px)",
                      }}
                      onClick={() => {
                        const copy = { ...tempSubTasks };
                        delete copy[subTask.id];
                        setTempSubTasks(copy);
                      }}
                    />
                  </div>
                ))
              : undefined}
            <IconButton
              icon={TbPlus}
              iconProps={{ size: 18 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "25px",
                borderRadius: "0.375rem",
              }}
              onClick={() => {
                const subTask = createSubTask();
                const copy = { ...tempSubTasks, [subTask.id]: subTask };
                setTempSubTasks(copy);
              }}
            >Add Subtask</IconButton>
          </div>
          
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <p>Badges</p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "2px",
            }}
          >
            {Object.values(tempBadges).length > 0 ? (
              <>
                {Object.values(tempBadges).map((badge) => (
                  <BadgeEdit
                    id={badge.id}
                    text={badge.text}
                    colour={badge.color}
                    onValueChange={(text) => {
                      setTempBadges({
                        ...tempBadges,
                        [badge.id]: { ...tempBadges[badge.id], text },
                      });
                    }}
                    onColorChange={(color) => {
                      setTempBadges({
                        ...tempBadges,
                        [badge.id]: { ...tempBadges[badge.id], color },
                      });
                    }}
                    onDelete={() => {
                      const copy = { ...tempBadges };
                      delete copy[badge.id];
                      setTempBadges(copy);
                    }}
                  />
                ))}
              </>
            ) : undefined}
            <IconButton
              className="badge"
              icon={TbPlus}
              onClick={() => {
                const badge = createBadge();
                const copy = { ...tempBadges, [badge.id]: badge };
                setTempBadges(copy);
              }}
            />
          </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "right",
              gap: "5px",
            }}
          >
            <IconButton
              icon={TbCheck}
              iconProps={{ size: 24 }}
              style={{
                width: "40px",
                aspectRatio: 1,
                borderRadius: "0.375rem",
              }}
              onClick={() => {
                if (taskTitleRef.current) {
                  console.log(taskTitleRef.current.value);
                  dispatch(
                    updateTitle.action({
                      id,
                      type: BoardObjects.TASK,
                      title: taskTitleRef.current.value,
                    })
                  );
                }
                if (taskSummaryRef.current) {
                  dispatch(
                    updateContent.action({
                      id,
                      type: BoardObjects.TASK,
                      content: taskSummaryRef.current.value,
                    })
                  );
                }
                if (tempBadges) {
                  dispatch(
                    setBadges({
                      taskId: id,
                      badges: tempBadges,
                    })
                  );
                }
                if (tempSubTasks) {
                  dispatch(
                    setSubTasks({
                      taskId: id,
                      subTasks: tempSubTasks,
                    })
                  );
                }
                updateSizeFromElement();
                setOpen(false);
              }}
            />
            <IconButton
              icon={TbX}
              iconProps={{ size: 24 }}
              style={{
                appearance: "none",
                width: "40px",
                height: "40px",
                borderRadius: "0.375rem",
              }}
              onClick={() => {
                setTempBadges(badges);
                setTempSubTasks(subTasks);
                setOpen(false);
              }}
            />
          </div>
        </Modal>
      </NodeWrapper>
    </>
  );
};

export default Task;
