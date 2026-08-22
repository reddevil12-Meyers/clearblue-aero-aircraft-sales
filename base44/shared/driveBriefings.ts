const ROOT_FOLDER_NAME = "Aircraft Briefings";
const DRIVE_API = "https://www.googleapis.com/drive/v3";

export const getDriveToken = async (base44) => {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
  return accessToken;
};

const escapeSingleQuote = (s) => String(s).replace(/'/g, "\\'");

const listFiles = async (token, q) => {
  const res = await fetch(`${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=200`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Drive list failed: ${await res.text()}`);
  const data = await res.json();
  return data.files || [];
};

const createFolder = async (token, name, parents) => {
  const body = { name, mimeType: "application/vnd.google-apps.folder" };
  if (parents && parents.length) body.parents = parents;
  const res = await fetch(`${DRIVE_API}/files?fields=id,name`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Drive create folder failed: ${await res.text()}`);
  return res.json();
};

export const findOrCreateRootFolder = async (token) => {
  const q = `name='${escapeSingleQuote(ROOT_FOLDER_NAME)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const existing = await listFiles(token, q);
  if (existing.length > 0) return existing[0].id;
  const folder = await createFolder(token, ROOT_FOLDER_NAME);
  return folder.id;
};

export const findOrCreateMakeFolder = async (token, rootId, make) => {
  const safeMake = make.trim();
  const q = `name='${escapeSingleQuote(safeMake)}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${rootId}' in parents`;
  const existing = await listFiles(token, q);
  if (existing.length > 0) return existing[0].id;
  const folder = await createFolder(token, safeMake, [rootId]);
  return folder.id;
};

export const briefingExists = async (token, folderId, filename) => {
  const q = `name='${escapeSingleQuote(filename)}' and trashed=false and '${folderId}' in parents`;
  const files = await listFiles(token, q);
  return files.length > 0;
};

export const uploadPdf = async (token, folderId, filename, pdfArrayBuffer) => {
  const contentType = "application/pdf";
  const metadata = { name: filename, mimeType: contentType, parents: [folderId] };
  const boundary = "briefing_boundary_314159";
  const enc = new TextEncoder();
  const metaBytes = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) + `\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`
  );
  const closeBytes = enc.encode(`\r\n--${boundary}--`);
  const pdfBytes = new Uint8Array(pdfArrayBuffer);
  const body = new Uint8Array(metaBytes.byteLength + pdfBytes.byteLength + closeBytes.byteLength);
  body.set(metaBytes, 0);
  body.set(pdfBytes, metaBytes.byteLength);
  body.set(closeBytes, metaBytes.byteLength + pdfBytes.byteLength);

  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary="${boundary}"`
    },
    body
  });
  if (!res.ok) throw new Error(`Drive upload failed: ${await res.text()}`);
  return res.json();
};