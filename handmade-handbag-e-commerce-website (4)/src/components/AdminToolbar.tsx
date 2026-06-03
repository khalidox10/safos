import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePublish } from "../context/PublishContext";
import { Eye, Lock, Download, Upload, Globe, Edit3, Check, AlertCircle } from "lucide-react";

export default function AdminToolbar({ onAdminClick }: { onAdminClick: () => void }) {
  const { status, lastEdited, lastPublished, publish, exportData, importData } = usePublish();
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safos-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importText.trim()) {
      importData(importText);
      setImportText("");
      setShowImport(false);
      alert("تم استيراد البيانات بنجاح! ✓");
    }
  };

  const formatDate = (d: Date | null) => {
    if (!d) return "غير محدد";
    return d.toLocaleDateString("ar-MA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Top Admin Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-[200] bg-[#1a1410] text-[#faf6ef] shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Left: Status */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              status === "draft"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-green-500/20 text-green-400 border border-green-500/30"
            }`}>
              {status === "draft" ? <Edit3 size={12} /> : <Globe size={12} />}
              {status === "draft" ? "مسودة (تعديل)" : "منشور (عام)"}
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs text-[#d4b483]/70">
              <span>آخر تعديل: {formatDate(lastEdited)}</span>
              <span>آخر نشر: {formatDate(lastPublished)}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Preview Button */}
            <button
              onClick={() => alert("أنتِ حالياً في وضع المعاينة. جميع التغييرات تُحفظ كمسودة.\n\nلن يرى الزبائن التغييرات حتى تضغطي على 'نشر'.")}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs bg-[#b8935a]/20 text-[#b8935a] rounded-lg hover:bg-[#b8935a]/30 transition"
            >
              <Eye size={13} /> معاينة
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              title="تصدير البيانات"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#b8935a]/20 transition"
            >
              <Download size={16} />
            </button>

            {/* Import */}
            <button
              onClick={() => setShowImport(true)}
              title="استيراد بيانات"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#b8935a]/20 transition"
            >
              <Upload size={16} />
            </button>

            {/* Admin Dashboard */}
            <button
              onClick={onAdminClick}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              <Lock size={13} />
              <span className="hidden md:inline">لوحة التحكم</span>
            </button>

            {/* Publish Button */}
            {status === "draft" && (
              <button
                onClick={publish}
                className="flex items-center gap-2 px-4 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-500 transition font-semibold shadow-lg shadow-green-900/30"
              >
                <Check size={13} /> نشر
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && (
          <div className="fixed inset-0 z-[210] bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#faf6ef] max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-[#b8935a]/20 flex justify-between items-center">
                <h3 className="font-display text-xl">استيراد بيانات</h3>
                <button onClick={() => setShowImport(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#b8935a]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-2 text-xs text-amber-800">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>سيتم استبدال البيانات الحالية بالبيانات المستوردة. تأكدي من عمل نسخة احتياطية أولاً.</span>
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="الصقي بيانات JSON هنا..."
                  className="w-full h-48 p-3 border border-[#b8935a]/30 rounded-lg text-xs font-mono focus:outline-none focus:border-[#b8935a]"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowImport(false)} className="px-4 py-2 text-sm border border-[#1a1410] rounded-lg hover:bg-[#1a1410] hover:text-[#faf6ef] transition">
                    إلغاء
                  </button>
                  <button onClick={handleImport} className="px-4 py-2 text-sm bg-[#1a1410] text-[#faf6ef] rounded-lg hover:bg-[#b8935a] transition">
                    استيراد
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
