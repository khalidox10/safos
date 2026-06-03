import { createContext, useContext, useState, ReactNode } from "react";

export type PublishStatus = "draft" | "published";

interface PublishContextType {
  status: PublishStatus;
  lastEdited: Date | null;
  lastPublished: Date | null;
  setDraft: () => void;
  publish: () => void;
  exportData: () => string;
  importData: (json: string) => void;
}

const PUBLISH_STORAGE_KEY = "safos_publish_status";
const DRAFT_STORAGE_KEY = "safos_draft_data";
const PUBLISHED_STORAGE_KEY = "safos_published_data";

const PublishContext = createContext<PublishContextType | undefined>(undefined);

export function PublishProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PublishStatus>(() => {
    if (typeof window === "undefined") return "draft";
    return (localStorage.getItem(PUBLISH_STORAGE_KEY) as PublishStatus) || "draft";
  });

  const [lastEdited, setLastEdited] = useState<Date | null>(() => {
    const saved = localStorage.getItem(`${DRAFT_STORAGE_KEY}_timestamp`);
    return saved ? new Date(saved) : null;
  });

  const [lastPublished, setLastPublished] = useState<Date | null>(() => {
    const saved = localStorage.getItem(`${PUBLISHED_STORAGE_KEY}_timestamp`);
    return saved ? new Date(saved) : null;
  });

  const setDraft = () => {
    setStatus("draft");
    localStorage.setItem(PUBLISH_STORAGE_KEY, "draft");
    // Copy current data to draft
    const currentData = localStorage.getItem("safos_store_data");
    if (currentData) {
      localStorage.setItem(DRAFT_STORAGE_KEY, currentData);
      localStorage.setItem(`${DRAFT_STORAGE_KEY}_timestamp`, new Date().toISOString());
      setLastEdited(new Date());
    }
  };

  const publish = () => {
    // Copy draft to published
    const draftData = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draftData) {
      localStorage.setItem(PUBLISHED_STORAGE_KEY, draftData);
      localStorage.setItem(`${PUBLISHED_STORAGE_KEY}_timestamp`, new Date().toISOString());
      setLastPublished(new Date());
    }
    setStatus("published");
    localStorage.setItem(PUBLISH_STORAGE_KEY, "published");
  };

  const exportData = () => {
    const data = {
      draft: localStorage.getItem(DRAFT_STORAGE_KEY),
      published: localStorage.getItem(PUBLISHED_STORAGE_KEY),
      status,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.draft) localStorage.setItem(DRAFT_STORAGE_KEY, data.draft);
      if (data.published) localStorage.setItem(PUBLISHED_STORAGE_KEY, data.published);
      if (data.status) {
        setStatus(data.status);
        localStorage.setItem(PUBLISH_STORAGE_KEY, data.status);
      }
    } catch (e) {
      console.error("Failed to import data:", e);
      alert("فشل استيراد البيانات. تأكد من صحة الملف.");
    }
  };

  return (
    <PublishContext.Provider value={{ status, lastEdited, lastPublished, setDraft, publish, exportData, importData }}>
      {children}
    </PublishContext.Provider>
  );
}

export function usePublish() {
  const ctx = useContext(PublishContext);
  if (!ctx) throw new Error("usePublish must be used within PublishProvider");
  return ctx;
}
