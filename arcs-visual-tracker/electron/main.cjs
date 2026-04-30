const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const isDev = !app.isPackaged;

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    },
]);

function registerAppProtocol() {
    protocol.registerFileProtocol('app', (request, callback) => {
        const requestUrl = new URL(request.url);

        let pathname = decodeURIComponent(requestUrl.pathname);

        if (pathname === '/' || pathname === '') {
            pathname = '/index.html';
        }

        const filePath = path.join(
            __dirname,
            '..',
            'dist',
            pathname.replace(/^\/+/, '')
        );

        callback({ path: filePath });
    });
}

function getSavesDirectory() {
    return path.join(app.getPath('userData'), 'campaign-saves');
}

function sanitizeSaveName(saveName) {
    const cleanedName = String(saveName || '')
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
        .replace(/\s+/g, ' ')
        .slice(0, 80);

    return cleanedName || 'arcs-campaign-save';
}

function getSaveFilePath(saveName) {
    const safeName = sanitizeSaveName(saveName);
    return path.join(getSavesDirectory(), `${safeName}.json`);
}

async function ensureSavesDirectory() {
    await fs.mkdir(getSavesDirectory(), { recursive: true });
}

async function readStoredSaveEntry(fileName) {
    const filePath = path.join(getSavesDirectory(), fileName);
    const stat = await fs.stat(filePath);
    const rawFile = await fs.readFile(filePath, 'utf-8');

    let parsed = null;

    try {
        parsed = JSON.parse(rawFile);
    } catch {
        parsed = null;
    }

    const fallbackName = fileName.replace(/\.json$/i, '');

    return {
        name: parsed?.saveName || parsed?.name || fallbackName,
        fileName,
        updatedAt: stat.mtimeMs,
    };
}

function registerSaveHandlers() {
    ipcMain.handle('list-game-saves', async () => {
        try {
            await ensureSavesDirectory();

            const fileNames = await fs.readdir(getSavesDirectory());
            const saveFileNames = fileNames.filter((fileName) =>
                fileName.toLowerCase().endsWith('.json')
            );

            const entries = await Promise.all(
                saveFileNames.map(async (fileName) => {
                    try {
                        return await readStoredSaveEntry(fileName);
                    } catch {
                        return null;
                    }
                })
            );

            return {
                ok: true,
                saves: entries
                    .filter(Boolean)
                    .sort((a, b) => b.updatedAt - a.updatedAt),
            };
        } catch (error) {
            return {
                ok: false,
                reason: error instanceof Error ? error.message : 'Could not list saves.',
            };
        }
    });

    ipcMain.handle('save-named-game-file', async (_event, saveName, saveFile) => {
        try {
            await ensureSavesDirectory();

            const safeName = sanitizeSaveName(saveName);
            const filePath = getSaveFilePath(safeName);

            const saveFileWithName = {
                ...saveFile,
                saveName: safeName,
                savedAt: new Date().toISOString(),
            };

            await fs.writeFile(filePath, JSON.stringify(saveFileWithName, null, 2), 'utf-8');

            return {
                ok: true,
                name: safeName,
                fileName: path.basename(filePath),
            };
        } catch (error) {
            return {
                ok: false,
                reason: error instanceof Error ? error.message : 'Could not save campaign.',
            };
        }
    });

    ipcMain.handle('open-named-game-file', async (_event, fileName) => {
        try {
            await ensureSavesDirectory();

            const safeFileName = path.basename(String(fileName || ''));
            const filePath = path.join(getSavesDirectory(), safeFileName);
            const rawFile = await fs.readFile(filePath, 'utf-8');

            return {
                ok: true,
                saveFile: JSON.parse(rawFile),
            };
        } catch (error) {
            return {
                ok: false,
                reason: error instanceof Error ? error.message : 'Could not open save.',
            };
        }
    });

    ipcMain.handle('delete-named-game-file', async (_event, fileName) => {
        try {
            await ensureSavesDirectory();

            const safeFileName = path.basename(String(fileName || ''));
            const filePath = path.join(getSavesDirectory(), safeFileName);

            await fs.unlink(filePath);

            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                reason: error instanceof Error ? error.message : 'Could not delete save.',
            };
        }
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 1000,
        minWidth: 1200,
        minHeight: 800,
        backgroundColor: '#050505',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadURL('app://arcs/index.html');
    }
}

app.whenReady().then(() => {
    registerSaveHandlers();

    if (!isDev) {
        registerAppProtocol();
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});