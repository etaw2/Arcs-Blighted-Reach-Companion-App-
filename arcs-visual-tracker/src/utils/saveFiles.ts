import type { GameSaveFile } from '../gameState';

export type DeleteSaveFileResult =
  | { ok: true }
  | { ok: false; reason: string };

export function createSaveFileName(saveName: string) {
  const cleanedName = saveName
    .trim()
    .replace(/[^a-z0-9-_ ]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

  const safeName = cleanedName || 'arcs-campaign-save';

  return `${safeName}.json`;
}

export async function downloadSaveFile(saveFile: GameSaveFile, fileName: string) {
  const blob = new Blob([JSON.stringify(saveFile, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export async function readSaveFileFromInput(file: File): Promise<GameSaveFile> {
  const text = await file.text();
  const parsed = JSON.parse(text) as GameSaveFile;

  if (!parsed || parsed.version !== 1 || !parsed.savedAt || !parsed.data) {
    throw new Error('Invalid Arcs save file.');
  }

  return parsed;
}

export async function deleteSaveFile(): Promise<DeleteSaveFileResult> {
  return {
    ok: false,
    reason: 'Delete save will be available in the desktop app.',
  };
}
