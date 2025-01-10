/** @jsxImportSource @emotion/react */
import "../App.css";

import { BoardObjects } from "../utils/enums/items.tsx";
import "../editor.scss";
import { bindActionCreators } from "redux";
import { connect, useDispatch, useSelector } from "react-redux";
import NodeWrapper from "./Modular/NodeWrapper.tsx";
import { useRef, useState } from "react";
import { TbCheck, TbPlus, TbX } from "react-icons/tb";
import CustomEditablePreview from "./Modular/CustomEditablePreview.tsx";
import {
  updateContent,
  updateSize,
  updateTitle,
} from "../utils/slices/nodeActions.ts";
import { Modal } from "./Modular/Modal.tsx";
import { setBadges, updateTaskStatus } from "../utils/slices/taskSlice.js";
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

const Task = ({ id, columnWidth, onContextMenu, scale, offset }) => {
  const dispatch = useDispatch();
  const nodeRef = useRef(null);

  const { pX, pY, sX, sY, content, title, status, deadline, badges, parent } =
    useSelector((state) => state.tasks[id]);

  if (nodeRef.current !== null) {
    const bounds = nodeRef.current.getBoundingClientRect();
    if (
      Math.abs(sX - bounds.width / scale) > 10 + 20 || // Padding is 10 on each side
      Math.abs(sY - bounds.height / scale) > 10 + 20 // Padding is 10 on each side
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
  }

  const [open, setOpen] = useState(false);
  const taskTitleRef = useRef(null);
  const taskSummaryRef = useRef(null);
  const [tempBadges, setTempBadges] = useState(badges);

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
        sX={sX}
        sY={sY}
        parentId={parent.id}
        parentType={parent.type}
        isInColumn={isInColumn}
        scale={scale}
        offset={offset}
        columnWidth={columnWidth}
        onContextMenu={onContextMenu}
      >
        <input
          type="checkbox"
          style={{ gridArea: "checkbox", height: "20px", alignSelf: "center" }}
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
                const badge = new BadgeClass().serialize();
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
