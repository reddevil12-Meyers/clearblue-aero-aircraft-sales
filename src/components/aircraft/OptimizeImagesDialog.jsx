import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { compressImageFromUrl } from "@/utils/compressImage";
import { Wand2, CheckCircle2 } from "lucide-react";

/**
 * Re-compresses existing aircraft photos in place: for every aircraft with
 * images, each photo is fetched, compressed (downscaled + re-encoded), and
 * re-uploaded only if it ends up meaningfully smaller. Originals are kept
 * when compression doesn't help or fails.
 */
export default function OptimizeImagesDialog({ open, onClose, onDone }) {
  const [status, setStatus] = useState('idle'); // idle | running | done
  const [log, setLog] = useState([]);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ processed: 0, optimized: 0, skipped: 0, failed: 0 });
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (open) {
      cancelledRef.current = false;
      setStatus('idle');
      setLog([]);
      setCurrent(0);
      setTotal(0);
      setStats({ processed: 0, optimized: 0, skipped: 0, failed: 0 });
      run();
    }
    return () => { cancelledRef.current = true; };
    // eslint-disable-next-line
  }, [open]);

  const addLog = (msg) => setLog(prev => [...prev.slice(-150), msg]);

  const run = async () => {
    setStatus('running');
    addLog('Loading aircraft inventory…');
    let aircraftList = [];
    try {
      aircraftList = await base44.entities.Aircraft.list('-created_date', 500);
    } catch (e) {
      addLog('Failed to load aircraft: ' + (e.message || 'error'));
      setStatus('done');
      return;
    }
    const withImages = aircraftList.filter(a => a.images && a.images.length > 0);
    setTotal(withImages.length);
    addLog(`Found ${withImages.length} aircraft with photos.`);

    let processed = 0, optimized = 0, skipped = 0, failed = 0;

    for (let i = 0; i < withImages.length; i++) {
      if (cancelledRef.current) break;
      const ac = withImages[i];
      setCurrent(i + 1);
      const title = `${ac.year || ''} ${ac.make || ''} ${ac.model || ''}`.trim() || ac.registration || ac.id;
      addLog(`Processing ${title}: ${ac.images.length} photo${ac.images.length > 1 ? 's' : ''}`);

      let changed = false;
      const newImages = [];
      for (const url of ac.images) {
        if (cancelledRef.current) break;
        try {
          const result = await compressImageFromUrl(url);
          if (result && result.wasCompressed && result.compressedSize < result.originalSize * 0.9) {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: result.file });
            newImages.push(file_url);
            optimized++;
            changed = true;
          } else if (result) {
            newImages.push(url);
            skipped++;
          } else {
            newImages.push(url);
            failed++;
            addLog(`  ⚠ Could not fetch a photo; keeping original.`);
          }
        } catch (e) {
          newImages.push(url);
          failed++;
          addLog(`  ⚠ Error on a photo (${e.message || 'error'}); keeping original.`);
        }
      }

      if (changed && !cancelledRef.current) {
        try {
          await base44.entities.Aircraft.update(ac.id, { images: newImages });
        } catch (e) {
          addLog(`  ⚠ Failed to save optimized photos for ${title}.`);
        }
      }
      processed++;
      setStats({ processed, optimized, skipped, failed });
    }

    addLog(cancelledRef.current ? 'Stopped.' : 'Optimization complete.');
    setStatus('done');
    if (onDone) onDone();
  };

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && status !== 'running') onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-accent" />
            Optimize Aircraft Photos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Re-compresses existing aircraft photos (downscaled to 1600×1200 and re-encoded as JPEG) and re-uploads only those that get meaningfully smaller. Originals are kept when compression doesn't help or fails. Leave this window open until finished.
          </p>

          {status === 'running' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Aircraft {current} of {total}</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} />
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-muted p-2">
              <div className="text-lg font-bold">{stats.processed}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Aircraft</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2">
              <div className="text-lg font-bold text-emerald-700">{stats.optimized}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Optimized</div>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <div className="text-lg font-bold">{stats.skipped}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Kept</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-2">
              <div className="text-lg font-bold text-amber-700">{stats.failed}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="max-h-44 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground font-mono space-y-0.5">
            {log.length === 0 ? <span>Waiting to start…</span> : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>

        <DialogFooter>
          {status === 'done' ? (
            <Button onClick={onClose} className="gap-2">
              <CheckCircle2 className="w-4 h-4" /> Done
            </Button>
          ) : (
            <Button variant="outline" disabled>Running…</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}