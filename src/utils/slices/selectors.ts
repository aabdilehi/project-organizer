import { createSelector, Selector } from "@reduxjs/toolkit";
import { BoardType, NodeType } from "../classes/new-classes";
import {
  DefinedBoardObjects,
  DragState,
  PlainRootState,
  SelectionState,
} from "./types";
import {
  ResizeDirection,
  DragAction,
  DragOrigin,
  DragRenderLayers,
} from "../enums/items";

//#endregion

//#region Drag properties

const selectDrag = (state: PlainRootState) => state.drag;
const selectLayer = (state: PlainRootState, layer: DragRenderLayers) => layer;

export const selectDraggedNodes: Selector<PlainRootState, DragState["nodes"]> =
  createSelector([selectDrag, selectLayer], (drag, layer) => {
    if (layer == null) return {};
    const ids: string[] = drag.layers[layer];
    const nodes: { [id: string]: Pick<NodeType, "id" | "type" | "parent"> } =
      {};
    ids.forEach((id) => {
      nodes[id] = drag.nodes[id];
    });

    return nodes;
  });

export const selectInitialPosition: Selector<
  PlainRootState,
  {
    x: number;
    y: number;
  }
> = (state) => state.drag.initialPosition;
export const selectTypes: Selector<
  PlainRootState,
  (ResizeDirection | DragAction | DragOrigin)[]
> = (state) => state.drag.types;
//#endregion

//#region Copy properties
export const selectCopiedNodes = (state: PlainRootState) => state.copied.nodes;
export const selectCopiedPosition = (state: PlainRootState) =>
  state.copied.position;
//#endregion

export const selectSelection: Selector<PlainRootState, SelectionState> = (
  state
) => state.selection;
