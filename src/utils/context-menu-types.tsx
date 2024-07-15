import { BoardObjects } from "./enums/items";

import { store } from "../store";
import { DocumentC } from "./classes/classes";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
} from "./slices/nodeActions";
import { ColumnClass, NodeClass, NoteClass } from "./classes/new-classes";

const convertNoteToDocument = (note) => {
  if (!note) return;

  const { ...newDocument } = new DocumentC({
    id: note.id,
    pX: note.pX,
    pY: note.pY,
    title:
      note.content.length > 10
        ? `${note.content.slice(0, 10)}...`
        : note.content,
    content: note.content,
    parent: note.parent,
  });

  store.dispatch(
    removeChild.action({
      id: note.parent.id,
      type: note.parent.type,
      cId: note.id,
    })
  );
  store.dispatch(removeNode.action({ id: note.id, type: BoardObjects.NOTE }));
  store.dispatch(addNode.action(newDocument));
  store.dispatch(
    addChild.action({
      id: note.parent.id,
      type: note.parent.type,
      cId: note.id,
      cType: BoardObjects.DOCUMENT,
    })
  );
};

const convertSelectedNodesToDocuments = () => {
  // I do not like accessing the state like this outside of components but to work around this would be such a huge pain
  const state = store.getState();
  const selectedNodes = state.selection;
  const notes = state.notes;

  for (const id in selectedNodes) {
    if (Object.prototype.hasOwnProperty.call(selectedNodes, id)) {
      const note = notes[id];

      // it should be notes but does not hurt to check
      if (!note) return;

      convertNoteToDocument(note);
    }
  }
};
export const NodeTypeMap: { [key in BoardObjects]: typeof NodeClass } = {
  [BoardObjects.NONE]: NodeClass,
  [BoardObjects.NOTE]: NoteClass,
  [BoardObjects.COLUMN]: ColumnClass,
  [BoardObjects.BOARD]: NodeClass,
  [BoardObjects.TODO]: NodeClass,
  [BoardObjects.IMAGE]: NodeClass,
  [BoardObjects.DOCUMENT]: NodeClass,
};

const createNode = (
  type: BoardObjects,
  parent: { id: string; type: BoardObjects },
  x?: number,
  y?: number
) => {
  const { ...newNode } = new NodeTypeMap[type]({ parent, pX: x, pY: y });
  store.dispatch(addNode.action(newNode));
  store.dispatch(
    addChild.action({
      id: parent.id,
      type: parent.type,
      cId: newNode.id,
      cType: newNode.type,
    })
  );
};

export type ContextMenuItem = {
  label: string;
  onClick?: (id: string) => any;
};

export type NewNodeMenuItem = {
  label: string;
  onClick?: (id: string, x: number, y: number) => any;
};

type ContextMenu = {
  canCopy: boolean;
  canCut: boolean;
  canPaste: boolean;
  canDelete: boolean;
  items: Array<ContextMenuItem | NewNodeMenuItem> | null[];
};

type ContextMenuMap = {
  [key in BoardObjects]: ContextMenu;
};

// Main Board (Nothing selected)
export const NullContextMenu: ContextMenu = {
  canCopy: false,
  canCut: false,
  canPaste: true,
  canDelete: false,
  items: [
    {
      label: "New Note",
      onClick: (id: string, x: number, y: number) =>
        createNode(BoardObjects.NOTE, { id, type: BoardObjects.BOARD }, x, y),
    },
    {
      label: "New Column",
      onClick: (id: string, x: number, y: number) =>
        createNode(BoardObjects.COLUMN, { id, type: BoardObjects.BOARD }, x, y),
    },
  ],
};

export const NoteContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: false,
  canDelete: true,
  items: [
    { label: "Convert to Document", onClick: convertSelectedNodesToDocuments },
  ],
};

export const ColumnContextMenu: ContextMenu = {
  canCopy: true,
  canCut: true,
  canPaste: true,
  canDelete: true,
  items: [],
};

// Board Icon
export const BoardIconContextMenu: ContextMenu = {
  canCopy: false,
  canCut: false,
  canPaste: true,
  canDelete: false,
  items: [],
};

export const ContextMenuTypes: ContextMenuMap = {
  [BoardObjects.NONE]: NullContextMenu,
  [BoardObjects.NOTE]: NoteContextMenu,
  [BoardObjects.BOARD]: BoardIconContextMenu,
  [BoardObjects.COLUMN]: ColumnContextMenu,
  [BoardObjects.TODO]: NullContextMenu,
  [BoardObjects.IMAGE]: NullContextMenu,
  [BoardObjects.DOCUMENT]: NullContextMenu,
};

export const reduceContextMenu = (types: BoardObjects[]) => {
  if (types.length <= 0) {
    return ContextMenuTypes[BoardObjects.NONE];
  }
  if ((types.length = 1)) {
    return ContextMenuTypes[types[0]];
  }

  const temp: ContextMenu = {
    canCopy: true,
    canCut: true,
    canPaste: true,
    canDelete: true,
    items: [], // for now this will stay empty unless there is only one type
  };

  types.forEach((type) => {
    // for some reason it wont let me do &= or *= without errors so i will do this the long way
    // technically i could add checks to stop doing anything if the value is already 0
    // but i feel the checks wouldnt save any performance and other values would still need to loop
    temp.canCopy = temp.canCopy && ContextMenuTypes[type].canCopy;
    temp.canCut = temp.canCut && ContextMenuTypes[type].canCut;
    temp.canPaste = temp.canPaste && ContextMenuTypes[type].canPaste;
    temp.canDelete = temp.canDelete && ContextMenuTypes[type].canDelete;
  });

  return temp;
};
