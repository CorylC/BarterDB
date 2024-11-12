import React from "react";

interface RequestButtonProps {
  text: string;
  onClick: () => void;
  styleType: "accept" | "deny";
}

export default function RequestButton({ text, onClick, styleType }: RequestButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${
        styleType === "accept" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {text}
    </button>
  );
}