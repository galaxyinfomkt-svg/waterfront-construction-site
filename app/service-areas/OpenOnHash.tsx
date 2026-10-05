"use client";
import { useEffect } from "react";

// Opens the <details> town list of the county a visitor jumps to (/service-areas#essex-county-ma),
// e.g. from a service page's "Every service in Essex County" link. Without JS the anchor still lands on
// the county heading and the list is one click away; all links are in the server HTML either way.
export default function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      const details = target?.querySelector("details");
      if (details && !details.open) {
        details.open = true;
        target?.scrollIntoView({ block: "start" });
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
