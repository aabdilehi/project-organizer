import { Binary, EJSON } from "bson";
import {
  BoardType,
  defaultSubTask,
  formatData,
  isRoot,
  NodeType,
  NodeTypeMap,
} from "../classes/new-classes";
import { BoardObjects } from "../enums/items";
import { addCopyNode, clearCopiedNodes, setPosition } from "./copiedSlice";
import { clearDragData, setDragData } from "./dragSlice";
import {
  addChild,
  addNode,
  removeChild,
  removeNode,
  setSliceData,
  updateSize,
} from "./nodeActions";
import { removeSelectNode } from "./selectionSlice";
import { updateTaskStatus as updateTaskStatusAction } from "./taskSlice";
import { updateImage } from "./imageSlice";
import { addImage, clearImages, setImages } from "./imageDataSlice";
import { addImageUrl, clearImageUrls, setImageUrls } from "./imageMapSlice";
import { AnyAction, Dispatch } from "redux";
import { nanoid, ThunkAction } from "@reduxjs/toolkit";
import {
  DefinedBoardObjects,
  NodeSliceMap,
  PlainRootState,
  SliceNodeMap,
} from "./types";
// export function updateNodeSize(id: string, type: BoardObjects, sX: number, sY: number) {
//     // fetchTodoByIdThunk is the "thunk function"
//     return (dispatch, getState) => {
//         const state = getState();
//         dispatch(updateSize.action({id, type, sX, sY}));
//     }
// }

export function removeNodeThunk(
  id: string,
  type: DefinedBoardObjects
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const state = getState();
    if (!type) return;
    const slice = NodeSliceMap[type];
    const node = state[slice][id];
    if (!node) return;
    // Create node and add to parent
    // dispatch(clearDragData());
    dispatch(removeSelectNode({ id: node.id }));
    if (!isRoot(node)) {
      dispatch(
        removeChild.action({
          id: node.parent.id,
          type: node.parent.type,
          cId: node.id,
        })
      );
    }
    dispatch(
      removeNode.action({
        id: node.id,
        type: node.type,
      })
    );
  };
}

export function deleteSelection(): ThunkAction<
  void,
  PlainRootState,
  unknown,
  AnyAction
> {
  return (dispatch, getState) => {
    const state: PlainRootState = getState();
    const selectedNodes = state.selection;

    for (const id in selectedNodes) {
      const selectedNode = selectedNodes[id];
      if (selectedNode) {
        dispatch(deleteRecursive(selectedNode.id, selectedNode.type));
      }
    }
  };
}

function deleteRecursive(
  id: string,
  type: DefinedBoardObjects
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const state = getState(); // Maybe just pass state as a param rather than doing this every time

    const slice = NodeSliceMap[type];
    const node = state[slice][id];
    if (!node) return;
    if (Object.hasOwn(node, "childRefs")) {
      (node as BoardType).childRefs.forEach(({ id, type }) => {
        dispatch(deleteRecursive(id!, type!));
      });
    }
    dispatch(removeNodeThunk(id, type));
  };
}

export function copySelectionThunk(
  boardId: string,
  x?: number,
  y?: number
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    dispatch(clearCopiedNodes(null));
    const state: PlainRootState = getState();
    const selectedNodes = state.selection;
    let centroidX = 0;
    let centroidY = 0;
    let centroidCount = 0;
    for (const id in selectedNodes) {
      const selectedNode = selectedNodes[id];
      if (selectedNode) {
        const slice = NodeSliceMap[selectedNode.type];
        const node = state[slice][selectedNode.id];
        if (node && !isRoot(node)) {
          centroidX += node.pX;
          centroidY += node.pY;
          centroidCount += 1;
          dispatch(copyRecursiveThunk(selectedNode.id, selectedNode.type));
        }
      }
    }
    if (x && y) {
      const { offset, scale } = state.boards[boardId];
      const newX = (x - offset.x) / scale;
      const newY = (y - offset.y) / scale;
      dispatch(setPosition({ x: newX, y: newY }));
      return;
    }
    const centroid = {
      x: centroidX / centroidCount,
      y: centroidY / centroidCount,
    };
    dispatch(setPosition(centroid));
  };
}

function copyRecursiveThunk(
  id: string,
  type: DefinedBoardObjects
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const state = getState();
    if (!type) return;
    const slice = NodeSliceMap[type];
    const node = state[slice][id];
    if (!node) return;
    if (Object.hasOwn(node, "childRefs")) {
      (node as BoardType).childRefs.forEach(({ id, type }) =>
        copyRecursiveThunk(id, type)
      );
    }
    dispatch(copyNodeThunk(id, type));
  };
}

function copyNodeThunk(
  id: string,
  type: DefinedBoardObjects
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const state = getState();
    if (!type) return;
    const slice = NodeSliceMap[type];
    const node = state[slice][id];
    if (!node) return;
    dispatch(addCopyNode(node));
  };
}

export function newNodeContextMenuThunk(
  boardId: string,
  x: number = 0,
  y: number = 0,
  type: DefinedBoardObjects
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const state = getState();

    // Get position relative to board
    const { offset, scale } = state.boards[boardId];
    const newX = (x - offset.x) / scale;
    const newY = (y - offset.y) / scale;

    const node: Partial<NodeType> = {
      type,
      parent: { id: boardId, type: BoardObjects.BOARD },
      pX: newX,
      pY: newY,
    };

    dispatch(createNodeThunk(node, true));
  };
}

export function pasteCopiedNodesThunk(
  boardId: string,
  x: number = 0,
  y: number = 0
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const state = getState();

    const { position, nodes } = state.copied;

    // Get position relative to board
    const { offset, scale } = state.boards[boardId];
    const newX = (x - offset.x) / scale;
    const newY = (y - offset.y) / scale;

    // Create one to one mapping of existing Ids to new Ids
    const mappedIds: { [id: string]: string } = {};
    nodes.forEach((node) => {
      const newId = nanoid();
      mappedIds[node.id] = newId;
    });

    // Iterate over nodes again and replace references to Id
    nodes.forEach((node) => {
      // Check if node is top-level based on whether its parent exists in mapping
      const hasMappedParent = Object.hasOwn(mappedIds, node.parent.id);

      // Create new node
      const newNode: Partial<BoardType> = {
        ...node,
        id: mappedIds[node.id],
        pX: node.pX - position.x + newX,
        pY: node.pY - position.y + newY,
        parent: hasMappedParent
          ? { id: mappedIds[node.parent.id], type: node.parent.type }
          : { id: boardId, type: BoardObjects.BOARD }, // if top-level node, assign to board
      };

      // Replace references to children to use new mapped Ids
      if (Object.hasOwn(node, "childRefs")) {
        newNode.childRefs = (node as BoardType).childRefs.map(
          ({ id, type }) => ({
            id: mappedIds[id],
            type,
          })
        );
      }

      // Actually create the nodes
      dispatch(createNodeThunk(newNode, !hasMappedParent)); // Top-level nodes need to call "addChild"
    });
  };
}

export function createNodeThunk(
  node: Partial<NodeType>,
  shouldAddChild: boolean = true
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    if (!Object.hasOwn(node, "type")) return;

    // Complete partial node data
    const newNode = formatData(node, NodeTypeMap[node.type!]);

    // console.log(newNode);
    // Create node and add to parent
    dispatch(addNode.action(newNode));
    if (!shouldAddChild) return;
    dispatch(
      addChild.action({
        id: newNode.parent.id,
        type: newNode.parent.type,
        cId: newNode.id,
        cType: newNode.type,
      })
    );
  };
}

// For importing
export function importDataThunk(
  data: any
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const stateKeys = Object.keys(data);

    // Clear out all current temp data
    dispatch(clearDragData());
    dispatch(clearCopiedNodes({}));
    dispatch(clearDragData());
    dispatch(clearImageUrls());
    dispatch(clearImages([]));
    // Set each slice's data (maybe put boards last?)
    stateKeys.forEach((key) => {
      dispatch(setSliceData.action({ nodes: data[key], merge: false }));
    });
    dispatch(generateImageUrlsThunk());
  };
}

export function addImageThunk(
  nodeId: string,
  image: Binary
): ThunkAction<void, PlainRootState, unknown, AnyAction> {
  return (dispatch, getState) => {
    const imageId = nanoid();
    // Add image data to state
    dispatch(addImage({ id: imageId, image }));

    // Add imageId to node
    dispatch(updateImage({ id: nodeId, imageId }));

    // Create mapping between imageId and image data
    const blob = new Blob([image.buffer as BlobPart]);
    const blobUrl = URL.createObjectURL(blob);
    dispatch(addImageUrl({ id: imageId, image: blobUrl })); // store blobURL in in-memory mapping
  };
}

export function generateImageUrlsThunk(): ThunkAction<
  void,
  PlainRootState,
  unknown,
  AnyAction
> {
  return (dispatch, getState) => {
    dispatch(clearImageUrls()); // Clear existing URLs

    const state = getState();
    const images = state.imageData;

    const imageMap: { [id: string]: string } = {};
    Object.keys(images).forEach((id: string) => {
      const image: Binary | undefined = images[id];
      if (!image) return;

      const blob = new Blob([image.buffer as BlobPart]);
      const url = URL.createObjectURL(blob);
      imageMap[id] = url;
    });
    console.log(state.imageData);
    console.log(imageMap);

    dispatch(setImageUrls(imageMap));
  };
}

// For exporting
export function prepareDataThunk(): ThunkAction<
  void,
  PlainRootState,
  unknown,
  AnyAction
> {
  return (dispatch, getState) => {
    // Weed out non-persisted state slices
    const { selection, copied, drag, imageMap, ...state } = getState();

    // Convert state to extended JSON so that we can serialize images
    const jsonData = EJSON.stringify(state);
    var file = new Blob([jsonData], { type: "application/json" });
    return file;
  };
}

export function addSelectedNodesToDraggedThunk(): ThunkAction<
  void,
  PlainRootState,
  unknown,
  AnyAction
> {
  return (dispatch, getState) => {
    const state = getState();
    const selection = state.selection;
    const dragged = state.drag;
    dispatch(setDragData({ ...dragged, nodes: selection }));
  };
}
