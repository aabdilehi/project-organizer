import { BoardObjects, SidebarObjects } from "../enums/items";
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
    sX: number;
    sY: number;
    content: string;
    constructor({id = undefined, pX = 0, pY = 0, sX = 200, sY = 200, content = `<p>New note</p>`, parent} : {id? : string, pX?: number, pY?: number, sX?: number, sY?: number, content?: string, parent: {id: string, type: BoardObjects}}) {
        super({id, type: BoardObjects.NOTE, pX, pY, parent});
        this.sX = sX;
        this.sY=  sY;
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
export class BadgeClass {
    id: string;
    text: string;
    color: string;
    constructor(text: string = "New Badge", color?: string) {
      this.id = uuidv4();
      this.text = text;
      this.color = color ?? "red"; // random colour eventually
    }
    serialize() {
        // everything except this method and the constructor
        const {constructor, serialize, ...badge} = Object.assign(this, {});
        return badge;
    }
    
  }
export class TaskClass extends NodeClass {
    title: string;
    status: boolean;
    content: string | undefined;
    badges: BadgeClass[] | [];
    deadline: Date | undefined;

    constructor({id = undefined, pX = 0, pY = 0, title = "New Task", content, status = false, badges = [], deadline, parent} : {id? : string, pX?: number, pY?: number, title?: string, content?: string, status?: boolean, badges?: BadgeClass[], deadline?: Date, parent: {id: string, type: BoardObjects}}) {
        super({id, type: BoardObjects.TASK, pX, pY, parent});
        this.title = title;
        this.status = status;
        this.content = content;
        this.badges = badges;
        this.deadline = deadline;
    }
}
export class BoardClass extends NodeClass {
    title: string;
    offset: {x: number, y: number};
    scale: number;
    childRefs: NodeClass[];
    constructor({id, pX = 0, pY = 0, title = "New board", offset = {x: 0, y: 0}, scale = 1, parent, childRefs = []} : {id? : string, pX?: number, pY?: number, title?: string, offset?: {x: number, y: number}, scale?: number, parent: {id: string, type: BoardObjects}, childRefs?: NodeClass[]}) {
        super({id, type: BoardObjects.BOARD, pX, pY, parent});
        this.title = title;
        this.offset = offset;
        this.scale = scale;
        this.childRefs = childRefs;
    }
}

export class ColumnClass extends NodeClass {
    sX: number;
    title: string;
    childRefs: NodeClass[];
    constructor({id, pX = 0, pY = 0, sX = 300, title = "New column", parent, childRefs = []} : {id? : string, pX?: number, pY?: number, sX?: number, title?: string, parent: {id: string, type: BoardObjects}, childRefs?: NodeClass[]}) {
        super({id, type: BoardObjects.COLUMN, pX, pY, parent});
        this.sX = sX;
        this.title = title;
        this.childRefs = childRefs;
    }
}

export const TypeClassMap : {[type in (BoardObjects | SidebarObjects)]: typeof NodeClass} = {
    [BoardObjects.NOTE]: NoteClass,
    [SidebarObjects.NOTE]: NoteClass,
    [BoardObjects.BOARD]: BoardClass,
    [SidebarObjects.BOARD]: BoardClass,
    [BoardObjects.COLUMN]: ColumnClass,
    [SidebarObjects.COLUMN]: ColumnClass,
    [BoardObjects.TASK]: TaskClass,
    [SidebarObjects.TASK]: TaskClass,
    [BoardObjects.DOCUMENT]: DocumentClass,
    [SidebarObjects.DOCUMENT]: DocumentClass,
    [BoardObjects.NONE]: NodeClass,
    [BoardObjects.IMAGE]: NodeClass,
    [SidebarObjects.IMAGE]: NodeClass
}

