import { useEffect } from "react";
import useBoardCollection from "./useBoardCollection";

const useBoardData = (board) => {
  const [data, setData] = useBoardCollection();

  useEffect(() => {
    console.log(data);
  }, [data]);

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

  return {
    data,
    addNote,
    addTodo,
    addColumn,
    updatePosition,
    updateSize,
    updateParent,
    updateContent,
    updateTaskStatus,
  };
};

export default useBoardData;
