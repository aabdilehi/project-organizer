import React from "react";
import DatePicker from "react-datepicker";
import { chakra, useTheme } from "@chakra-ui/react";

import "../react-datepicker.css";
import { format } from "date-fns";

const ChakraDatepicker = chakra(DatePicker);

const styles = (theme) => {
  return {
    // Input styles
    color: theme.colors.white,
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
    width: "100%",
    outline: "2px solid transparent",
    outlineOffset: "2px",
    height: theme.sizes[10],
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
    // Popper styles
    "& .react-datepicker-popper": {
      zIndex: "popover",
    },
    // Calendar styles
    "& .react-datepicker": {
      bg: "white",
      border: "1px solid",
      borderColor: "gray.300",
      borderRadius: "md",
      boxShadow: "lg",
      fontSize: "sm",
      fontWeight: "normal",
      color: "gray.800",
    },
    // Header styles
    "& .react-datepicker__header": {
      bg: "gray.50",
      borderBottom: "none",
      borderRadius: "md",
      p: "2",
    },
    // Month container styles
    "& .react-datepicker__month-container": {
      p: "2",
    },
    // Month header styles
    "& .react-datepicker__current-month": {
      fontSize: "lg",
      fontWeight: "bold",
    },
    // Navigation styles
    "& .react-datepicker__navigation": {
      top: "50%",
      transform: "translateY(-50%)",
      outline: "none",
      border: "none",
      bg: "transparent",
      _hover: {
        bg: "transparent",
      },
      _focus: {
        boxShadow: "none",
      },
    },
    "& .react-datepicker__navigation--previous": {
      left: "2",
      _hover: {
        color: "blue.500",
      },
    },
    "& .react-datepicker__navigation--next": {
      right: "2",
      _hover: {
        color: "blue.500",
      },
    },
    // Month table styles
    "& .react-datepicker__month": {
      margin: "0",
    },
    // Week header styles
    "& .react-datepicker__day-name": {
      fontWeight: "bold",
      color: "gray.600",
      width: "2.5rem",
      lineHeight: "2.5rem",
      textAlign: "center",
    },
    // Day styles
    "& .react-datepicker__day": {
      width: "2.5rem",
      lineHeight: "2.5rem",
      borderRadius: "full",
      textAlign: "center",
      cursor: "pointer",
      _hover: {
        bg: "gray.200",
      },
    },
    "& .react-datepicker__day--selected": {
      bg: "blue.500",
      color: "white",
      _hover: {
        bg: "blue.600",
      },
    },
    "& .react-datepicker__day--disabled": {
      color: "gray.400",
      cursor: "not-allowed",
      _hover: {
        bg: "transparent",
      },
    },
  };
};

const Datepicker = ({ selectedDate, onChange, ...props }) => {
  const theme = useTheme();
  return (
    <ChakraDatepicker
      selected={selectedDate}
      onChange={onChange}
      {...props}
      sx={styles(theme)}
      popperPlacement="bottom"
      dateFormat="dd/MM/yyyy"
    />
  );
};

export default Datepicker;

// .react-datepicker__header {
//   text-align: center;
//   background-color: red;
//   border-bottom: 1px solid #aeaeae;
//   border-top-left-radius: 0.3rem;
//   padding: 8px 0;
//   position: relative;
// }
