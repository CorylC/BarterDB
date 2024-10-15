import { HTMLProps } from "react";

export default function TextInput(props: HTMLProps<HTMLInputElement>) {
  return (
    <input
      type="text"
      className="ml-2 p-1 border border-1 border-black rounded"
      {...props}
    />
  );
}
