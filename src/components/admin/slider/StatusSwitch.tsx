import React from "react";
export const StatusSwitch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`inline-flex h-6 w-11 items-center rounded-full transition ${
      checked ? "bg-emerald-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`m-1 h-4 w-4 rounded-full bg-white transition ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);
