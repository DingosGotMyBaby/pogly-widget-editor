import { useCallback, useEffect, useRef, useState } from "react";
import { WidgetEditor } from "./components/WidgetEditor";
import { WidgetData } from "./types/WidgetData";

const EMPTY_WIDGET: WidgetData = {
  widgetName: "",
  widgetWidth: 128,
  widgetHeight: 128,
  headerTag: "",
  bodyTag: "",
  styleTag: "",
  scriptTag: "",
  variables: [],
};

const electronAPI = (window as any).electronAPI;
const SAVE_DIRECTORY_KEY = "widgetIDE_saveDirectory";

export default function App() {
  const [widgetData, setWidgetData] = useState<WidgetData>(EMPTY_WIDGET);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveDirectory, setSaveDirectory] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SAVE_DIRECTORY_KEY);
    } catch {
      return null;
    }
  });

  const saveRef = useRef<(saveAs?: boolean) => Promise<void>>(async () => {});

  const handleChange = useCallback((next: WidgetData) => {
    setWidgetData(next);
    setIsDirty(true);
  }, []);

  const handleNew = useCallback(() => {
    setWidgetData(EMPTY_WIDGET);
    setCurrentFilePath(null);
    setIsDirty(false);
  }, []);

  const handleOpen = useCallback(async () => {
    const result = await electronAPI.openWidgetFile();
    if (!result) return;
    setWidgetData(result.data);
    setCurrentFilePath(result.filePath);
    setIsDirty(false);
  }, []);

  const handleChooseSaveDirectory = useCallback(async () => {
    const path = await electronAPI.selectSaveDirectory();
    if (path) setSaveDirectory(path);
  }, []);

  const handleClearSaveDirectory = useCallback(() => {
    setSaveDirectory(null);
  }, []);

  const handleSave = useCallback(
    async (saveAs = false) => {
      const data = widgetData;
      if (saveAs) {
        const path = await electronAPI.saveWidgetFileAs(data, saveDirectory, widgetData.widgetName);
        if (path) {
          setCurrentFilePath(path);
          setIsDirty(false);
        }
      } else {
        const path = await electronAPI.saveWidgetFile(data, currentFilePath, saveDirectory, widgetData.widgetName);
        if (path) {
          setCurrentFilePath(path);
          setIsDirty(false);
        }
      }
    },
    [widgetData, currentFilePath, saveDirectory],
  );

  useEffect(() => {
    try {
      if (saveDirectory) {
        localStorage.setItem(SAVE_DIRECTORY_KEY, saveDirectory);
      } else {
        localStorage.removeItem(SAVE_DIRECTORY_KEY);
      }
    } catch {}
  }, [saveDirectory]);

  useEffect(() => {
    saveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    const unNew = electronAPI.onMenuNew(handleNew);
    const unOpen = electronAPI.onMenuOpen(handleOpen);
    const unSave = electronAPI.onMenuSave(() => saveRef.current(false));
    const unSaveAs = electronAPI.onMenuSaveAs(() => saveRef.current(true));
    return () => {
      unNew();
      unOpen();
      unSave();
      unSaveAs();
    };
  }, [handleNew, handleOpen]);

  return (
    <div className="w-screen h-screen flex flex-col">
      <WidgetEditor
        value={widgetData}
        onChange={handleChange}
        isDirty={isDirty}
        saveDirectory={saveDirectory}
        onChooseSaveDirectory={handleChooseSaveDirectory}
        onClearSaveDirectory={handleClearSaveDirectory}
        onSave={() => saveRef.current(false)}
        onNew={handleNew}
        onOpen={handleOpen}
      />
    </div>
  );
}
