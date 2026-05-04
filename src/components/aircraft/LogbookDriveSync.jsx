import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, CloudUpload, FolderOpen, Check, Loader2, ExternalLink } from "lucide-react";

// Google Drive Picker API key - uses the Drive connector's access token
const GOOGLE_API_KEY = null; // Not needed for upload; picker uses OAuth token

export default function LogbookDriveSync({ logbook_urls = [], onChange, aircraftTitle }) {
  const [syncing, setSyncing] = useState({}); // { [idx]: true }
  const [syncResults, setSyncResults] = useState({}); // { [url]: driveLink }
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderId, setFolderId] = useState(null);
  const [folderLink, setFolderLink] = useState(null);

  const updateUrl = (idx, val) => {
    const updated = [...logbook_urls];
    updated[idx] = val;
    onChange(updated);
  };

  const removeUrl = (idx) => onChange(logbook_urls.filter((_, i) => i !== idx));

  const addUrl = () => onChange([...logbook_urls, '']);

  const ensureFolder = async () => {
    if (folderId) return folderId;
    setCreatingFolder(true);
    const folderName = aircraftTitle ? `ClearBlue Aero – ${aircraftTitle} Logbooks` : 'ClearBlue Aero – Aircraft Logbooks';
    const res = await base44.functions.invoke('createDriveFolder', { folder_name: folderName });
    setCreatingFolder(false);
    if (res.data?.folder?.id) {
      setFolderId(res.data.folder.id);
      setFolderLink(res.data.folder.webViewLink);
      return res.data.folder.id;
    }
    return null;
  };

  const syncOne = async (url, idx) => {
    if (!url) return;
    setSyncing(prev => ({ ...prev, [idx]: true }));
    const folder = await ensureFolder();
    const res = await base44.functions.invoke('syncLogbookToDrive', {
      logbook_url: url,
      aircraft_title: aircraftTitle,
      folder_id: folder,
    });
    setSyncing(prev => ({ ...prev, [idx]: false }));
    if (res.data?.drive_file?.webViewLink) {
      setSyncResults(prev => ({ ...prev, [url]: res.data.drive_file.webViewLink }));
    }
  };

  const syncAll = async () => {
    const validUrls = logbook_urls.filter(u => u && u.startsWith('http'));
    for (let i = 0; i < logbook_urls.length; i++) {
      if (logbook_urls[i] && logbook_urls[i].startsWith('http')) {
        await syncOne(logbook_urls[i], i);
      }
    }
  };

  const anySyncing = Object.values(syncing).some(Boolean);

  return (
    <div className="space-y-3">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {folderLink && (
            <a href={folderLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
              <FolderOpen className="w-3.5 h-3.5" />
              Open Drive Folder
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          {logbook_urls.some(u => u && u.startsWith('http')) && (
            <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={syncAll} disabled={anySyncing || creatingFolder}>
              {anySyncing || creatingFolder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
              Sync All to Drive
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-2" onClick={addUrl}>
            <Plus className="w-4 h-4" /> Add URL
          </Button>
        </div>
      </div>

      {/* URL list */}
      {logbook_urls.length === 0 ? (
        <p className="text-sm text-muted-foreground">No logbook URLs added yet. Add links to scanned logbook files, then sync them to Google Drive.</p>
      ) : (
        <div className="space-y-2">
          {logbook_urls.map((url, idx) => {
            const isSyncing = syncing[idx];
            const synced = syncResults[url];
            return (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  type="url"
                  value={url}
                  onChange={e => updateUrl(idx, e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                {synced ? (
                  <a href={synced} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 font-medium flex-shrink-0 hover:underline">
                    <Check className="w-3.5 h-3.5" />
                    In Drive
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-700 gap-1 px-2"
                    disabled={!url || !url.startsWith('http') || isSyncing || creatingFolder}
                    onClick={() => syncOne(url, idx)}
                    title="Upload this file to Google Drive"
                  >
                    {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                    {isSyncing ? '' : 'Sync'}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => removeUrl(idx)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {creatingFolder && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          Creating Drive folder…
        </p>
      )}
    </div>
  );
}