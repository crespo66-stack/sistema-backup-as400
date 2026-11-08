import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface RowMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const MENU_WIDTH = 160;

// Menú de tres puntos ( ... ) al final de cada fila.
// Se dibuja encima de todo (portal) para que la tabla no lo recorte.
export default function RowMenu({ items }: { items: RowMenuItem[] }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => setPos(null);

  const toggle = () => {
    if (pos) return close();
    const r = btnRef.current!.getBoundingClientRect();
    const menuHeight = items.length * 38 + 8;
    const openUp = r.bottom + menuHeight > window.innerHeight;
    setPos({
      top: openUp ? r.top - menuHeight - 4 : r.bottom + 4,
      left: Math.max(8, r.right - MENU_WIDTH),
    });
  };

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [pos]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-surface-hover transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: MENU_WIDTH }}
            className="z-[60] bg-surface-card border border-surface-border rounded-lg shadow-xl py-1"
          >
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => { close(); it.onClick(); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-surface-hover ${
                  it.danger ? "text-red-400" : "text-slate-200"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}