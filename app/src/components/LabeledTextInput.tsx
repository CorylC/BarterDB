import TextInput from "./TextInput";

export default function LabeledTextInput({
  label,
  errorMessage,
  id,
  type,
  placeholder,
}: {
  label: string;
  errorMessage?: string;
  id: string;
  type?: string;
  placeholder?: string;
}) {
  const labelClassName = errorMessage ? "text-red-500" : "";
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {errorMessage || label}
      </label>
      <TextInput name={id} id={id} type={type} placeholder={placeholder} />
    </div>
  );
}
