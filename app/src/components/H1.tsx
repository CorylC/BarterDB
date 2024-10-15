export default function H1({
  children,
  className,
}: {
  children;
  className?: string;
}) {
  const css = `font-bold text-4xl ${className}`;
  return <h1 className={css}>{children}</h1>;
}
