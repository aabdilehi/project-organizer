import { useCallback, useEffect, useRef } from "react";
import { BoardObjects } from "../enums/items";
import useBoardCollection from "./useBoardCollection";

const useBoardData = (board) => {
  const selectedRef = useRef(null);
  const [data, setData] = useBoardCollection();

  useEffect(() => {}, [data]);

  const addNote = (id, pX, pY, sX, sY, text, parent) => {
    setData((prevData) => {
      prevData.push({
        id: id,
        type: "note",
        pos: { x: pX, y: pY },
        size: { x: sX, y: sY },
        content: text,
        parent: parent,
      });
      return [...prevData];
    });
  };

  const addTodo = (id, pX, pY, text, parent) => {
    setData((prevData) => {
      prevData.push({
        id: id,
        type: "to-do",
        pos: { x: pX, y: pY },
        content: text,
        parent: parent,
        deadline: null,
        summary: "",
        taskStatus: false,
      });
      return [...prevData];
    });
  };

  const addColumn = (id, pX, pY, title, parent) => {
    setData((prevData) => {
      prevData.push({
        id: id,
        type: "column",
        pos: { x: pX, y: pY },
        size: { x: 200, y: 200 },
        content: title,
        parent: parent,
      });
      return [...prevData];
    });
  };

  const addImage = (id, pX, pY, parent) => {
    setData((prevData) => {
      prevData.push({
        id: id,
        type: "image",
        pos: { x: pX, y: pY },
        size: { x: 300, y: 300 },
        image: null,
        content: "",
        parent: parent,
      });
      return [...prevData];
    });
  };

  const getChildren = useCallback(
    (parentID) => {
      return data.filter((item) => item.parent.id === parentID);
    },
    [data]
  );

  const deleteComponent = (id) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      if (prevData[index].type === BoardObjects.COLUMN) {
        prevData.forEach((item, itemIndex) => {
          if (item.parent.id === id) {
            prevData[itemIndex].parent = {
              id: "board",
              type: BoardObjects.BOARD,
            };
          }
        });
      }
      prevData.splice(index, 1);
      return [...prevData];
    });
  };

  const deleteFocusedElement = () => {
    deleteComponent(selectedRef.current);
    console.log(`Deleted: ${selectedRef.current}`);
    selectedRef.current = null;
  };

  const setFocusedElement = (ref) => {
    selectedRef.current = ref;
    console.log(ref);
  };

  // const updateProperty = ({ id, property, newValue }) => {
  //   setData((prevData) => {
  //     let index = prevData.findIndex((b) => b.id === id);
  //     if (index === -1) {
  //       return [...prevData];
  //     }
  //     prevData[index][property] = newValue;
  //     return [...prevData];
  //   });
  // };

  const updatePosition = (id, pX, pY) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].pos = { x: pX, y: pY };
      return [...prevData];
    });
  };

  const updateSize = (id, sX, sY) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].size = { x: sX, y: sY };
      return [...prevData];
    });
  };

  const updateParent = (id, pX, pY, newParent, shouldRelocate) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }

      prevData[index].parent = newParent;
      if (shouldRelocate) {
        prevData[index].pos = { x: pX, y: pY };
      }
      return [...prevData];
    });
  };

  // either use switch case on type or make multiple functions for this as different names for content
  const updateContent = (id, newContent) => {
    setData((prevData) => {
      let index = prevData.findIndex((p) => p.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].content = newContent;
      return [...prevData];
    });
  };

  const updateTaskStatus = (id) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].taskStatus = !prevData[index].taskStatus;
      return [...prevData];
    });
  };

  const updateDeadline = (id, date) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].deadline = date;
      return [...prevData];
    });
  };

  const updateSummary = (id, summary) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].summary = summary;
      return [...prevData];
    });
  };

  const updateImage = (id, src) => {
    setData((prevData) => {
      let index = prevData.findIndex((b) => b.id === id);
      if (index === -1) {
        return [...prevData];
      }
      prevData[index].image = src;
      return [...prevData];
    });
  };

  return {
    data,
    addNote,
    addTodo,
    addColumn,
    addImage,
    updatePosition,
    updateSize,
    updateParent,
    updateContent,
    updateTaskStatus,
    updateDeadline,
    updateSummary,
    updateImage,
    setFocusedElement,
    deleteFocusedElement,
    getChildren,
  };
};

export default useBoardData;
