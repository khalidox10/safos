import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { useLang, LANGS, Lang } from "../context/LanguageContext";

export default function LanguageSwitcher({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find(l => l.code === lang)!;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSelect = (code: Lang) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Change language"
        title="Change language"
        className={
          variant === "full"
            ? "flex items-center gap-2 px-3 py-2 border border-[#b8935a]/30 rounded-full hover:bg-[#b8935a]/10 active:scale-95 transition-all text-sm"
            : "w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#b8935a]/10 active:scale-95 transition-all relative"
        }
      >
        {variant === "full" ? (
          <>
            <span className="text-lg leading-none">{current.flag}</span>
            <span className="text-xs font-medium tracking-wider uppercase">{current.code}</span>
          </>
        ) : (
          <>
            <Globe size={17} />
            <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none">{current.flag}</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 left-0 right-0 mx-auto w-44 bg-white shadow-2xl border border-[#b8935a]/15 rounded-xl overflow-hidden z-[120]"
            style={{ left: "auto", right: "auto" }}
          >
            <div className="py-1.5">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleSelect(l.code)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors hover:bg-[#f0e8d8]/60 ${
                    l.code === lang ? "bg-[#b8935a]/10 text-[#b8935a] font-semibold" : "text-[#2b1d12]"
                  }`}
                >
                  <span className="text-xl leading-none">{l.flag}</span>
                  <span className="flex-1 text-start">{l.nativeLabel}</span>
                  {l.code === lang && <Check size={14} className="text-[#b8935a]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
