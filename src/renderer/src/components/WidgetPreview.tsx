import { useEffect, useMemo, useRef } from "react";
import Moveable, { OnDrag, OnResize } from "react-moveable";
import { WidgetData } from "../types/WidgetData";
import { compileWidgetToHtml } from "../utils/widgetCodeCompiler";

interface IProps {
  widget: WidgetData;
}

const WidgetPreview = ({ widget }: IProps) => {
  const widgetRef = useRef<any>(null);
  const moveableRef = useRef<Moveable>(null);
  const iframeHtml = compileWidgetToHtml(widget);
  const iframeSrc = useMemo(() => URL.createObjectURL(new Blob([iframeHtml], { type: "text/html" })), [iframeHtml]);

  useEffect(() => {
    return () => URL.revokeObjectURL(iframeSrc);
  }, [iframeSrc]);

  useEffect(() => {
    if (!widgetRef.current) return;
    widgetRef.current.style.width = `${widget.widgetWidth}px`;
    widgetRef.current.style.height = `${widget.widgetHeight}px`;
    moveableRef.current?.updateRect();
  }, [widget.widgetWidth, widget.widgetHeight]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: 10,
        paddingRight: 0,
        boxSizing: "border-box",
        background: "var(--color-surface)",
        userSelect: "none",
      }}
    >
      <div ref={widgetRef} style={{ display: "inline-block", width: widget.widgetWidth, height: widget.widgetHeight }}>
        <iframe
          src={iframeSrc}
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          style={{ border: "none", display: "block", userSelect: "none", pointerEvents: "none" }}
          scrolling="no"
          width="100%"
          height="100%"
          title="widget preview"
        />
      </div>

      <Moveable
        ref={moveableRef}
        target={widgetRef}
        container={null}
        origin={false}
        edge={false}
        resizable={true}
        draggable={true}
        scalable={false}
        onDrag={({ target, transform }: OnDrag) => { target.style.transform = transform; }}
        onResize={({ target, width, height, delta }: OnResize) => {
          delta[0] && (target.style.width = `${width}px`);
          delta[1] && (target.style.height = `${height}px`);
        }}
      />
    </div>
  );
};

export default WidgetPreview;
