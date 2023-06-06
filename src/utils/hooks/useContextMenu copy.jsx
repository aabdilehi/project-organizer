import { useDisclosure } from "@chakra-ui/react";
import { useRef, useState } from "react";

export function useContextMenu({ containerRef, triggerRef }) {
  const menuRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleRightClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("pressed");
    const boundingRect = containerRef.current.getBoundingClientRect();

    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;

    setMousePos({ x: mouseX, y: mouseY });
    onOpen();
  };

  return { mousePos, menuRef, handleRightClick, isOpen, onOpen, onClose };
}
