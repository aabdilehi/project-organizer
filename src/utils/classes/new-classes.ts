import { BoardObjects } from "../enums/items";
import {v4 as uuidv4} from "uuid";

export class NodeClass {
    id : string;
    type: BoardObjects;
    pX: number;
    pY: number;
    parent: {id: string, type: BoardObjects};
    constructor({id, type, pX = 0, pY = 0, parent} : {id? : string, type?: BoardObjects, pX?: number, pY?: number, parent: {id: string, type: BoardObjects}}) {
        this.id = id ?? uuidv4();
        this.type = type || BoardObjects.NONE;
        this.pX = pX;
        this.pY = pY;
        this.parent = parent;
    }

    serialize() {
        // everything except this method and the constructor
        const {constructor, serialize, ...node} = Object.assign(this, {});
        return node;
    }
}


export class NoteClass extends NodeClass {
    size: {x: number, y: number};
    content: string;
    constructor({id = undefined, pX = 0, pY = 0, sX = 200, sY = 200, content = `<p>New note</p>`, parent} : {id? : string, pX?: number, pY?: number, sX?: number, sY?: number, content?: string, parent: {id: string, type: BoardObjects}}) {
        super({id, type: BoardObjects.NOTE, pX, pY, parent});
        this.size = {x: sX, y: sY};
        this.content = content;
    }
}
export class DocumentClass extends NodeClass {
    title: string;
    content: string;
    constructor({id = undefined, pX = 0, pY = 0, title = "New document", content = `<p>New note</p>`, parent} : {id? : string, pX?: number, pY?: number, title?: string, content?: string, parent: {id: string, type: BoardObjects}}) {
        super({id, type: BoardObjects.DOCUMENT, pX, pY, parent});
        this.title = title,
        this.content = content;
    }
}

export class BoardClass extends NodeClass {
    title: string;
    childRefs: NodeClass[];
    constructor({id, pX = 0, pY = 0, title = "New board", parent, childRefs = []} : {id? : string, pX?: number, pY?: number, title?: string, parent: {id: string, type: BoardObjects}, childRefs?: NodeClass[]}) {
        super({id, type: BoardObjects.BOARD, pX, pY, parent});
        this.title = title;
        this.childRefs = childRefs;
    }
}

export class ColumnClass extends NodeClass {
    sX: number;
    title: string;
    childRefs: NodeClass[];
    constructor({id, pX = 0, pY = 0, sX = 200, title = "New column", parent, childRefs = []} : {id? : string, pX?: number, pY?: number, sX?: number, title?: string, parent: {id: string, type: BoardObjects}, childRefs?: NodeClass[]}) {
        super({id, type: BoardObjects.COLUMN, pX, pY, parent});
        this.sX = sX;
        this.title = title;
        this.childRefs = childRefs;
    }
}

