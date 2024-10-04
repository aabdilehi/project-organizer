import { EmptyObject } from "redux";
import { PersistPartial } from "redux-persist/es/persistReducer";
import { BoardObjects } from "./items";

// So long and appears so frequently that it is probably better to do this
export type StoreState = EmptyObject & {
  boards: {
    root: {
      id: string;
      title: string;
      childRefs: never[];
    };
  };
  columns: {};
  notes: {};
  pictures: {};
  tasks: {};
  documents: {};
  selection: {
    [id: string]: {
      id: string;
      type: BoardObjects;
      parent: {
        id: string;
        type: BoardObjects;
      };
    };
  };
  copied: {
    position: { x: number; y: number };
    nodes: [];
  };
  drag: {
    // Copied from selection
    [id: string]: {
      id: string;
      type: BoardObjects;
      parent: {
        id: string;
        type: BoardObjects;
      };
    };
  };
} & PersistPartial;
