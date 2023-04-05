import { schema } from "normalizr";

export const boardSchema = new schema.Entity("boards");
export const columnSchema = new schema.Entity("columns");
export const noteSchema = new schema.Entity("notes");
export const pictureSchema = new schema.Entity("pictures");
export const taskSchema = new schema.Entity("tasks");

const containers = new schema.Union(
  {
    boards: boardSchema,
    columns: columnSchema,
  },
  "type"
);

const nodes = new schema.Union(
  {
    boards: boardSchema,
    columns: columnSchema,
    notes: noteSchema,
    pictures: pictureSchema,
    tasks: taskSchema,
  },
  "type"
);

noteSchema.define({
  parent: containers,
});

pictureSchema.define({
  parent: containers,
});

taskSchema.define({
  parent: containers,
});

columnSchema.define({
  parent: containers,
  children: [nodes],
});

boardSchema.define({
  parent: containers,
  children: [nodes],
});
