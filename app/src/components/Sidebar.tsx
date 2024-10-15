import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBars } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "@remix-run/react";
import Link from "./Link";

const SIDEBAR_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Account", to: "/account" },
  { label: "Search", to: "/search" },
  { label: "New Listing", to: "/new-listing" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <div
      className="border-r border-black h-screen sidebar flex flex-col justify-start items-center pt-3 text-lg gap-2"
      style={{ width: isOpen ? 240 : 60 }}
    >
      {isOpen ? (
        <>
          <div className="w-full flex justify-end px-4">
            <FontAwesomeIcon
              onClick={() => setIsOpen(false)}
              icon={faArrowLeft}
              className="w-8 h-8"
            />
          </div>
          {SIDEBAR_LINKS.map((link) =>
            link.to === location.pathname ? (
              <p className="font-bold underline">{link.label}</p>
            ) : (
              <Link href={link.to}>{link.label}</Link>
            )
          )}
        </>
      ) : (
        <div>
          <FontAwesomeIcon
            onClick={() => setIsOpen(true)}
            icon={faBars}
            className="w-8 h-8"
          />
        </div>
      )}
    </div>
  );
}
