import React, { PropsWithChildren, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

type Props = PropsWithChildren<{
  content?: React.ReactNode;
  offset?: number;
  maxWidth?: number | string;
}>;

export const HoverTooltip = ({ children, content, offset = 14, maxWidth = 360 }: Props) => {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!open) return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      requestAnimationFrame(() => setPos({ ...mouseRef.current }));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [open]);

  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!open || !tip) return;
    const { innerWidth: vw, innerHeight: vh } = window;
    const rect = tip.getBoundingClientRect();
    let x = pos.x + offset;
    let y = pos.y + offset;
    if (x + rect.width + 8 > vw) x = Math.max(8, pos.x - offset - rect.width);
    if (y + rect.height + 8 > vh) y = Math.max(8, pos.y - offset - rect.height);
    tip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (!ready) setReady(true);
  }, [pos, open, offset, ready]);

  return (
    <>
      <span
        className="inline-flex w-full h-full"
        onMouseEnter={(e) => {
          mouseRef.current = { x: e.clientX, y: e.clientY };
          setPos({ x: e.clientX, y: e.clientY });
          setReady(false);
          setOpen(true);
        }}
        onMouseLeave={() => { setOpen(false); setReady(false); }}
      >
        {children}
      </span>
      {open && content
        ? createPortal(
            <TooltipBubble ref={tipRef} $ready={ready} style={{ maxWidth, transform: `translate3d(${pos.x + offset}px, ${pos.y + offset}px, 0)` }}>
              {content}
            </TooltipBubble>,
            document.body,
          )
        : null}
    </>
  );
};

const TooltipBubble = styled.div<{ $ready: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  pointer-events: none;
  width: fit-content;
  white-space: nowrap;
  opacity: ${(p) => (p.$ready ? 1 : 0)};
  transition: opacity 80ms ease;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 13px;
  line-height: 1.25;
  color: var(--color-tooltip-text);
  background: var(--color-tooltip-bg);
  border: 1px solid var(--color-tooltip-border);
  box-shadow: var(--shadow-tooltip);
`;
