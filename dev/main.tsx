import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import ComprehensiveExample from "../COMPREHENSIVE_EXAMPLE";
import KeyFunctionalityTest from "../KEY_FUNCTIONALITY_TEST";
import QuickFixTest from "../QUICK_FIX_TEST";
import SerialNumberExample from "../SERIAL_NUMBER_EXAMPLE";
import TableActionShowExample from "../TABLE_ACTION_SHOW_EXAMPLE";
import MultipleInstancesExample from "../MULTIPLE_INSTANCES_EXAMPLE";

// Create a test app that showcases all the new features
const TestApp = () => {
  const [activeTab, setActiveTab] = useState("serial");

  const tabs = [
    { id: "serial", label: "Serial Numbers", component: SerialNumberExample },
    {
      id: "actions",
      label: "Conditional Actions",
      component: TableActionShowExample,
    },
    {
      id: "multiple",
      label: "Multiple Instances",
      component: MultipleInstancesExample,
    },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || SerialNumberExample;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                nc-table-react v0.3.5
              </h1>
              <p className="text-sm text-gray-500">
                Testing New Features Locally
              </p>
            </div>
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
