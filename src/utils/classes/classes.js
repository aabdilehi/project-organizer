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
  constructor(pX, pY, sX = 200, sY = 200, content = `<p>New note</p>`, parent) {
    this.id = uuidv4();
    this.type = BoardObjects.NOTE;
    this.pX = pX;
    this.pY = pY;
    this.sX = sX;
    this.sY = sY;
    this.content = content;
    this.parent = parent;
  }
}

export class TaskC {
  constructor(
    pX,
    pY,
    text = "New task",
    taskStatus = false,
    summary = "",
    deadline = null,
    badges = {},
    parent
  ) {
    this.id = uuidv4();
    this.type = BoardObjects.TODO;
    this.pX = pX;
    this.pY = pY;
    this.text = text;
    this.taskStatus = taskStatus;
    this.summary = summary;
    this.deadline = deadline;
    this.badges = badges;
    this.parent = parent;
  }
}
