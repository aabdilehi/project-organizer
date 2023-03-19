import { Box } from "@chakra-ui/react";
import React from "react";

const SelectionMarquee = (initPX, initPY, endPX, endPY) => {
  return (
    <Box
      opacity={0.5}
      bgColor="gray.600"
      border="1px solid"
      borderColor={"gray.500"}
      left={Math.min(initPX, endPX) + "px"}
      width={Math.abs(endPX - initPX) + "px"}
      top={Math.min(initPY, endPY) + "px"}
      height={Math.abs(endPY - initPY) + "px"}
    ></Box>
  );
};

export default SelectionMarquee;
