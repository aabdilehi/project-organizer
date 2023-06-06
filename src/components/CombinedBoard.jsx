import React from "react";
import Sidebar from "@/components/Sidebar";
import Board from "@/components/Board";
import { useState, useEffect } from "react";
import { Box, Stack } from "@chakra-ui/react";
import DarkModeIconButton from "@/components/DarkModeIconButton";
import HelpIconButton from "@/components/HelpIconButton";
import { useDispatch } from "react-redux";
import { getBoards } from "@/utils/slices/boardSlice";
import { getNotes } from "@/utils/slices/noteSlice";
import { getDocuments } from "@/utils/slices/docSlice";
import { getPictures } from "@/utils/slices/pictureSlice";
import { getColumns } from "@/utils/slices/columnSlice";

const CombinedBoard = ({ data, boardId }) => {
  const [isLoading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    const parsedData = JSON.parse(data);
    dispatch(getBoards(parsedData.boards));
    dispatch(getNotes(parsedData.notes));
    dispatch(getDocuments(parsedData.documents));
    dispatch(getPictures(parsedData.pictures));
    dispatch(getColumns(parsedData.columns));
    setLoading(false);
  }, []);
  if (isLoading) return "Loading";
  return (
    <>
      <Box position="absolute" top={2} right={2} zIndex={"popover"}>
        <DarkModeIconButton m={1} />
        <HelpIconButton m={1} />
      </Box>

      <Stack w={"full"} m={0} p={0} gap={0} direction="row" id="container">
        <Sidebar />
        <Board boardId={boardId} />
      </Stack>
    </>
  );
};
export default CombinedBoard;
