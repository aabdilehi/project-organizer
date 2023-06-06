import React from "react";
import DatePicker from "react-datepicker";
import {
  Badge,
  Box,
  chakra,
  Textarea,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";

import { format } from "date-fns";

const ChakraDatepicker = chakra(DatePicker);

const styles = (theme, showInput) => {
  return {
    // Input styles
    display: showInput ? undefined : "none",
    height: theme.sizes[10],
    width: "100%",
    color: "var(--chakra-colors-chakra-body-text)",
    fontSize: "md",
    bg: "inherit",
    fontWeight: theme.fontWeights.normal,
    lineHeight: theme.lineHeights.normal,
    fontFamily: "inherit",
    border: "1px solid",
    borderRadius: theme.radii.md,
    borderColor: "inherit",
    boxShadow: theme.shadows.sm,
    padding: theme.space[4],
    outline: "2px solid transparent",
    outlineOffset: "2px",
    _focus: {
      outline: "none",
      borderColor: theme.colors.blue[500],
      boxShadow: `0 0 0 1px ${theme.colors.blue[500]}`,
    },
    _hover: {
      borderColor: theme.colors.gray[500],
    },
    _disabled: {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  };
};

const ChkrDatepicker = ({
  selectedDate,
  onChange,
  urm,
  showInput = true,
  ...props
}) => {
  const theme = useTheme();
  return (
    <ChakraDatepicker
      ref={urm}
      selected={selectedDate}
      onChange={onChange}
      {...props}
      sx={styles(theme, showInput)}
      dateFormat="dd/MM/yyyy"
    />
  );
};

export default ChkrDatepicker;

// .react-datepicker__header {
//   text-align: center;
//   background-color: red;
//   border-bottom: 1px solid #aeaeae;
//   border-top-left-radius: 0.3rem;
//   padding: 8px 0;
//   position: relative;
// }
