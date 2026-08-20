import { useState } from "react";
import { QrCode as QrIcon, Printer, Download } from "lucide-react";

const SITE_ORIGIN = "https://clearblueaero.com";
const QR_API = "https://api.qrserver.com/v1/create-qr-code/";

export default function EmployeeQrCard({ employee }) {
  const [open, setOpen] = useState(false);
  if (!employee?.referral_code) return null;

  const url = `${SITE_ORIGIN}/?rep=${encodeURIComponent(employee.referral_code)}`;
  const qrSrc = `${QR_API}?size=300x300&margin=10&data=${encodeURIComponent(url)}`;
  const fullName = `${employee.first_name} ${employee.last_name}`;

  const downloadQr = async () => {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `QR-${employee.referral_code}-${employee.last_name || "employee"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Could not download the QR image. You can still right-click the QR and choose 'Save image as…'.");
    }
  };

  const printQr = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${fullName} — QR Code</title></head>
      <body style="text-align:center;font-family:Arial,sans-serif;padding:48px;">
        <img src="${qrSrc}" width="300" height="300" />
        <p style="font-weight:bold;margin-top:16px;font-size:20px">${fullName}</p>
        <p style="color:#666;font-size:14px">${employee.title || "Sales Manager"} — ClearBlue Aero</p>
        <p style="color:#999;font-size:12px;margin-top:4px">${url}</p>
        <script>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
        <QrIcon className="w-4 h-4" /> View QR
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <img src={qrSrc} width={260} height={260} className="mx-auto rounded-lg" alt="QR code" />
            <p className="font-bold text-lg mt-4">{fullName}</p>
            <p className="text-sm text-muted-foreground">{employee.title || "Sales Manager"}</p>
            <p className="text-xs text-muted-foreground mt-1">Code: <code className="font-bold text-accent">{employee.referral_code}</code></p>
            <p className="text-xs text-muted-foreground mt-2 break-all">{url}</p>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={downloadQr} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-accent hover:brightness-110">
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <button onClick={printQr} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-muted">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold border border-border">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}