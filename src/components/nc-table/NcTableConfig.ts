// Centralized static configuration for NcTable search/filter UI

export type NcTableOperator = {
  text: string;
  value: string;
};

export const NC_TABLE_OPERATORS: NcTableOperator[] = [
  { text: "Equals", value: "==" },
  { text: "Not Equals", value: "!=" },
  { text: "Greater Than", value: ">" },
  { text: "Greater Than or Equals", value: ">=" },
  { text: "Less Than", value: "<" },
  { text: "Less Than or Equals", value: "<=" },
  { text: "Contains", value: "~=" },
  { text: "Not Contains", value: "!~=" },
  { text: "Starts With", value: "_=" },
  { text: "Not Starts With", value: "!_=" },
  { text: "Ends With", value: "|=" },
  { text: "Not Ends With", value: "!|=" },
];

export type NcTableOption<T = unknown> = {
  text: string;
  value: T;
};

export const NC_TABLE_BOOLEAN_OPTIONS: NcTableOption<boolean>[] = [
  { text: "Yes", value: true },
  { text: "No", value: false },
];

export const NC_TABLE_YES_NO_OPTIONS: NcTableOption<number>[] = [
  { text: "Yes", value: 1 },
  { text: "No", value: 0 },
];
