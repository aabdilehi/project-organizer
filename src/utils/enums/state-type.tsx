import { EmptyObject } from "redux";
import { PersistPartial } from "redux-persist/es/persistReducer";

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
  selection: {};
  copied: {
    position: { x: number; y: number };
    nodes: [];
  };
} & PersistPartial;
