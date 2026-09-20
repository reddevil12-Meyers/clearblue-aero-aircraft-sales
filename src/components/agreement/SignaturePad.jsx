import { useRef, useState, useEffect } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Canvas signature pad with a typed-signature fallback.
// onChange receives a PNG data URL of the signature, or null when empty.
export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const emit = () => {
    if (canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const pos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const start = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    const c = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    c.fillStyle = "#0f2540";
    c.beginPath();
    c.arc(x, y, 1.5, 0, Math.PI * 2);
    c.fill();
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const c = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    c.strokeStyle = "#0f2540";
    c.lineWidth = 2.5;
    c.lineCap = "round";
    c.lineTo(x, y);
    c.stroke();
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setHasInk(true);
    emit();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  const useTyped = () => {
    const name = typedName.trim();
    if (!name) return;
    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "#0f2540";
    c.font = "italic 48px Georgia, 'Times New Roman', serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(name, canvas.width / 2, canvas.height / 2 + 6);
    setHasInk(true);
    emit();
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        style={{ touchAction: "none" }}
        className="w-full h-40 rounded-lg border-2 border-dashed border-slate-300 bg-white cursor-crosshair"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder="Or type your name here"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={useTyped} disabled={!typedName.trim()}>
          Type Signature
        </Button>
        <Button type="button" variant="ghost" onClick={clear} disabled={!hasInk} className="gap-2">
          <Eraser className="w-4 h-4" /> Clear
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Draw your signature above with your finger or mouse — or type your name and press "Type Signature".
      </p>
    </div>
  );
}