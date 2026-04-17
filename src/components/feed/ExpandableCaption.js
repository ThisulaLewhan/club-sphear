"use client";

import { useState, useRef, useEffect } from "react";

export default function ExpandableCaption({ content }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      // Check if the text is actually overflowing (i.e. needs clamping)
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [content]);

  return (
    <div className="mb-3">
      <div
        ref={textRef}
        className={`text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal ${
          isExpanded ? "" : "line-clamp-3"
        }`}
      >
        {content}
      </div>
      {isClamped && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 mt-1 transition-colors"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
