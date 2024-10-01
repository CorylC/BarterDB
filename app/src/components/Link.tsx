import { Link as RemixLink } from "@remix-run/react";

export default function Link({
  children,
  className: classNameProp,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const to = props.href as string;
  const className = `text-blue-500 hover:text-blue-700 ${classNameProp}`;

  return (
    <RemixLink className={className} to={to} {...props}>
      {children}
    </RemixLink>
  );
}
