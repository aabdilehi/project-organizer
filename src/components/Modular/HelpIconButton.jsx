import { FaRegQuestionCircle as QuestionIcon } from "react-icons/fa";
import {
  Box,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useRef } from "react";
import addItemTut from "@/assets/add_item_to_board.gif";
import dragItemTut from "@/assets/drag_to_move.gif";
import editTextTut from "@/assets/edit_text.gif";
import panBoardTut from "@/assets/pan.gif";
import zoomBoardTut from "@/assets/zoom.gif";

const HelpIconButton = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const finalRef = useRef(null);

  return (
    <>
      <Modal
        size={"2xl"}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader as={"h2"} fontWeight={"800"} fontSize={"3xl"}>
            How to use?
          </ModalHeader>
          <ModalBody m={1.5} mt={-2}>
            <Stack alignItems={"center"} direction={"column"}>
              <Box m={1} w={"70%"}>
                <Text p={2}>
                  Hold middle mouse button and move your mouse to pan the board.
                </Text>
                <Image src={panBoardTut} rounded={"md"}></Image>
              </Box>
              <Box m={1} w={"70%"}>
                <Text p={2}>Scroll to zoom.</Text>
                <Image src={zoomBoardTut} rounded={"md"}></Image>
              </Box>
              <Box m={1} w={"70%"}>
                <Text p={2}>
                  Drag items from the sidebar onto the canvas to add items.
                </Text>
                <Image src={addItemTut} rounded={"md"}></Image>
              </Box>
              <Box m={1} w={"70%"}>
                <Text p={2}>Click once on the text to edit.</Text>
                <Image src={editTextTut} rounded={"md"}></Image>
              </Box>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <IconButton
        onClick={onOpen}
        icon={<QuestionIcon />}
        aria-label="dark-mode-toggle"
        {...props}
      />
    </>
  );
};

export default HelpIconButton;
