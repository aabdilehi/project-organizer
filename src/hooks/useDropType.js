import { useContext } from "react";
import { DropTypeContext } from "../components/DropTypeContext";

// Define and export a custom hook
export const useDropType = () => useContext(DropTypeContext);
