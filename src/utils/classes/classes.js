import { v4 as uuidv4 } from "uuid";
import { BoardObjects } from "../enums/items";

const getRandomColour = () => {
  const potentialColours = [
    "gray",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "cyan",
    "purple",
    "pink",
    "linkedin",
    "facebook",
    "messenger",
    "whatsapp",
    "twitter",
    "telegram",
  ];
  return potentialColours.splice(
    (Math.random() * potentialColours.length) | 0,
    1
  );
};

export class BadgeC {
  constructor(text = "New Badge", colour) {
    this.id = uuidv4();
    this.text = text;
    this.colour = !!colour ? colour : getRandomColour();
  }
}

export class NoteC {
  constructor({
    id = undefined,
    pX = 0,
    pY = 0,
    sX = 200,
    sY = 200,
    content = `<p>New note</p>`,
    parent,
  }) {
    this.id = id ? id : uuidv4();
    this.type = BoardObjects.NOTE;
    this.pX = pX;
    this.pY = pY;
    this.sX = sX;
    this.sY = sY;
    this.content = content;
    this.parent = parent;
  }
}

export class DocumentC {
  constructor({
    id = undefined,
    pX = 0,
    pY = 0,
    title = "New Document",
    content = `<p>Content goes here</p>`,
    expanded = false,
    parent,
  }) {
    this.id = id ? id : uuidv4();
    this.type = BoardObjects.DOCUMENT;
    this.pX = pX;
    this.pY = pY;
    (this.title = title), (this.content = content);
    this.expanded = expanded;
    this.parent = parent;
  }
}

export class TaskC {
  constructor({
    pX = 0,
    pY = 0,
    title = "New task",
    taskStatus = false,
    content = "",
    deadline = null,
    badges = {},
    parent,
  }) {
    this.id = uuidv4();
    this.type = BoardObjects.TASK;
    this.pX = pX;
    this.pY = pY;
    this.title = title;
    this.taskStatus = taskStatus;
    this.content = content;
    this.deadline = deadline;
    this.badges = badges;
    this.parent = parent;
  }
}

export class PictureC {
  constructor({
    pX = 0,
    pY = 0,
    sX = 200,
    sY = 200,
    image = undefined,
    label = undefined,
    showLabel = false,
    parent,
  }) {
    this.id = uuidv4();
    this.type = BoardObjects.IMAGE;
    this.pX = pX;
    this.pY = pY;
    this.sX = sX;
    this.sY = sY;
    this.image = image;
    this.label = label;
    this.showLabel = showLabel;
    this.parent = parent;
  }
}

export class BoardC {
  constructor({ pX = 0, pY = 0, title = "New Board", parent, childRefs = [] }) {
    this.id = uuidv4();
    this.type = BoardObjects.BOARD;
    this.pX = pX;
    this.pY = pY;
    this.title = title;
    this.parent = parent;
    this.childRefs = childRefs;
  }
}

export class ColumnC {
  constructor({
    pX = 0,
    pY = 0,
    sX = 200,
    title = "New Column",
    parent,
    childRefs = [],
  }) {
    this.id = uuidv4();
    this.type = BoardObjects.COLUMN;
    this.pX = pX;
    this.pY = pY;
    this.sX = sX;
    this.title = title;
    this.parent = parent;
    this.childRefs = childRefs;
  }
}
