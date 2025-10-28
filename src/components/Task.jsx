/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useEffect, useRef, useState } from "react";
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
import { createBadge, createSubTask } from "../utils/classes/new-classes.ts";

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};

const Task = ({ id, onContextMenu, scale, offset }) => {
  const dispatch = useDispatch();
  const nodeRef = useRef(null);
  const checkBoxRef = useRef(null); // React does not seem to support the indeterminate property so we have to set it manually
  const task = useSelector((state) => state.tasks[id]);
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
      requestAnimationFrame(() => {
        nodeRef.current.style.height = sY + "px";
      });
    }
  };

  // updateSizeFromElement();

  if (checkBoxRef.current) {
    checkBoxRef.current.indeterminate = indeterminate;
  }

  const [open, setOpen] = useState(false);
  const taskTitleRef = useRef(null);
  const taskSummaryRef = useRef(null);
  const [tempBadges, setTempBadges] = useState(badges);
  const [tempSubTasks, setTempSubTasks] = useState(subTasks);

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
          style={{ gridArea: "checkbox", height: "20px", alignSelf: "center" }}
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
          canEdit={true}
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
              <BadgePreview id={badge.id} text={badge.text} />
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
              style={{
                appearance: "none",
                padding: "8px",
                boxSizing: "border-box",
                border: "1px grey",
                lineHeight: "1.375",
                borderRadius: "0.375rem",
                fontSize: "inherit",
                outline: "none",
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
            <label htmlFor="task-summary">Summary:</label>

            <AutoResizeTextArea
              ref={taskSummaryRef}
              name="task-summary"
              defaultValue={content}
              style={{
                appearance: "none",
                padding: "8px",
                boxSizing: "border-box",
                border: "1px grey",
                lineHeight: "1.375",
                borderRadius: "0.375rem",
                fontSize: "inherit",
                outline: "none",
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
                      padding: "10px",
                      margin: "10px",
                      border: "1px solid grey",
                      borderRadius: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        gridArea: "checkbox",
                        height: "20px",
                        alignSelf: "center",
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
                        padding: "8px",
                        appearance: "none",
                        boxSizing: "border-box",
                        border: "1px grey",
                        lineHeight: "1.375",
                        borderRadius: "0.375rem",
                        fontSize: "inherit",
                        outline: "none",
                      }}
                    />
                    <IconButton
                      className="badge"
                      icon={TbX}
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
              className="badge"
              icon={TbPlus}
              onClick={() => {
                const subTask = createSubTask();
                const copy = { ...tempSubTasks, [subTask.id]: subTask };
                setTempSubTasks(copy);
              }}
            />
          </div>
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
                    onChange={(text) => {
                      const copy = { ...tempBadges };
                      copy[badge.id].text = text;
                      setTempBadges(copy);
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
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "right",
            }}
          >
            <button
              type="button"
              style={{
                width: "40px",
                height: "40px",
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
            >
              <TbCheck size={24} />
            </button>
            <button
              type="button"
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
            >
              <TbX size={24} />
            </button>
          </div>
        </Modal>
      </NodeWrapper>
    </>
  );
};

export default Task;
