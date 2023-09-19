"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3Line() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
  }, []);
  return <div>D3Line</div>;
}
