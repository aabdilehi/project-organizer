/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import { EditorContent } from "@tiptap/react";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useNavigate } from "react-router-dom";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  TbStar as StarIcon,
  TbCheck,
  TbCross,
  TbPlus,
  TbX,
} from "react-icons/tb";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import { updateContent, updateTitle } from "../utils/slices/nodeActions.ts";
import { Modal } from "./Modular/Modal.tsx";
import {
  addBadge,
  removeBadge,
  updateBadgeText,
  updateTaskStatus,
} from "../utils/slices/taskSlice.jsx";
import { BadgeEdit, BadgePreview } from "./Modular/Badge.tsx";
import AutoResizeTextArea from "./Modular/AutoResizeTextArea.tsx";
import IconButton from "./Modular/IconButton.tsx";
import { BadgeClass } from "../utils/classes/new-classes.ts";

const previewStyle = {
  fontWeight: "800",
  width: "100%",
  margin: "auto",
  borderRadius: "5px",
};

const Task = ({
  id,
  pX,
  pY,
  title,
  content,
  status,
  badges,
  deadline,
  columnWidth,
  parent,
  onContextMenu,
}) => {
  const dispatch = useDispatch();
  const nodeRef = useRef();
  const [open, setOpen] = useState(false);
  const taskTitleRef = useRef(null);
  const taskSummaryRef = useRef(null);

  // Determines sizing and positioning based on whether in column or not
  let isInColumn = parent.type === BoardObjects.COLUMN;

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
        parent={parent}
        isInColumn={isInColumn}
        columnWidth={columnWidth}
        onContextMenu={onContextMenu}
      >
        <input
          type="checkbox"
          style={{ gridArea: "checkbox" }}
          checked={status}
          onChange={(e) => {
            console.log(e.target.value);

            dispatch(
              updateTaskStatus({
                taskId: id,
                status: e.target.checked,
              })
            );
          }}
        />
        <CustomEditablePreview
          as={"p"}
          style={{ gridArea: "title" }}
          canEdit={true}
          text={title}
          textStyle={previewStyle}
          onChange={(value) =>
            dispatch(
              updateTitle.action({
                id,
                type: BoardObjects.TASK,
                title: value,
              })
            )
          }
        />
        <button
          type="button"
          style={{ gridArea: "edit" }}
          onClick={() => {
            setOpen(true);
          }}
        >
          Edit
        </button>
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
              onClick={() => setOpen(false)}
            >
              <TbX size={24} />
            </button>
          </div>
          <div>
            {Object.values(badges).length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "2px",
                }}
              >
                {Object.values(badges).map((badge) => (
                  <BadgeEdit
                    text={badge.text}
                    onChange={(text) =>
                      dispatch(
                        updateBadgeText({ taskId: id, badgeId: badge.id, text })
                      )
                    }
                    onDelete={() => {
                      dispatch(removeBadge({ taskId: id, badgeId: badge.id }));
                    }}
                  />
                ))}
              </div>
            ) : undefined}
            <IconButton
              icon={TbPlus}
              onClick={() =>
                dispatch(
                  addBadge({
                    taskId: id,
                    newBadge: new BadgeClass().serialize(),
                  })
                )
              }
            />
          </div>
        </Modal>
      </NodeWrapper>
    </>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps;
  const task = state.tasks[id];
  return {
    pX: task.pX,
    pY: task.pY,
    title: task.title,
    content: task.content,
    status: task.status,
    deadline: task.deadline,
    badges: task.badges,
    parent: task.parent,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Task);
