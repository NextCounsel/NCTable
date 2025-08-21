import React from "react";
import {
  NcTable,
  type Column,
  type TableAction,
} from "../src/components/nc-table";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

// Minimal i18n setup (NcTable uses useTranslation)
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "en",
    resources: { en: { translation: {} } },
    interpolation: { escapeValue: false },
  });
}

type User = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
};

const data: User[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", status: "active" },
  { id: 2, name: "Alan Turing", email: "alan@example.com", status: "inactive" },
  { id: 3, name: "Grace Hopper", email: "grace@example.com", status: "active" },
];

const columns: Column<User>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  {
    key: "status",
    header: "Status",
    render: (u) => (
      <span
        className={u.status === "active" ? "text-green-600" : "text-gray-500"}
      >
        {u.status}
      </span>
    ),
  },
];

const actions: TableAction<User>[] = [
  { label: "View", onClick: (u) => alert(`Viewing ${u.name}`) },
];

export default function StaticDataExample() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="p-6">
        <NcTable<User>
          data={data}
          columns={columns}
          actions={actions}
          idField="id"
        />
      </div>
    </I18nextProvider>
  );
}
