export enum BoardObjects {
  NONE = "none", // no nodes selected (e.g. right clicking on multiple nodes)
  NOTE = "note",
  BOARD = "board",
  TASK = "task",
  GROUP = "group",
  IMAGE = "image",
  DOCUMENT = "document",
}

export const DragSignature = "app/signature";

export const enum DragAction {
  RESIZE = "action/resize",
  MOVE = "action/move",
  SELECT = "action/select",
}

export const enum DragOrigin {
  BOARD = "origin/board",
  TOOLBAR = "origin/toolbar",
}

export enum ResizeDirection {
  TOP = "top",
  TOPLEFT = "topleft",
  TOPRIGHT = "topright",
  LEFT = "left",
  RIGHT = "right",
  BOTTOM = "bottom",
  BOTTOMLEFT = "bottomleft",
  BOTTOMRIGHT = "bottomright",
}

export const enum DragRenderLayers {
  BOTTOM,
  TOP,
}
