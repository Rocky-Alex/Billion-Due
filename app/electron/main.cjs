const { app, BrowserWindow, ipcMain, safeStorage } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

function appDirectories() {
  return [
    path.join(app.getPath("appData"), "BillionDue"),
    path.join(app.getPath("appData"), "LedgerShield"),
  ];
}

function protectedWrite(fileName, value) {
  if (!safeStorage.isEncryptionAvailable())
    throw new Error("OS secure storage unavailable");
  const encrypted = safeStorage
    .encryptString(JSON.stringify(value))
    .toString("base64");
  for (const dir of appDirectories()) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, fileName),
        JSON.stringify({ version: 1, protected: encrypted }),
        "utf8",
      );
    } catch {}
  }
}

function protectedRead(fileName, fallback = null) {
  for (const dir of appDirectories()) {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, "utf8");
        if (content.charCodeAt(0) === 0xfeff) {
          content = content.slice(1);
        }
        const parsed = JSON.parse(content.trim());
        if (parsed && parsed.protected) {
          if (!safeStorage.isEncryptionAvailable())
            throw new Error("OS secure storage unavailable");
          return JSON.parse(
            safeStorage.decryptString(Buffer.from(parsed.protected, "base64")),
          );
        }
        return parsed;
      } catch (err) {
        console.error("Error reading protected file from", filePath, err);
      }
    }
  }
  return fallback;
}

function createWindow() {
  const iconPath = path.join(__dirname, "icon.ico");
  const win = new BrowserWindow({
    title: "BillionDue — Turn invoices into income.",
    icon: iconPath,
    width: 1480,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    titleBarOverlay: { color: "#ffffff", symbolColor: "#0f172a", height: 38 },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  const devUrl =
    process.env.VITE_DEV_SERVER_URL ||
    (!app.isPackaged ? "http://localhost:3002" : null);
  if (devUrl) {
    win.loadURL(devUrl).catch(() => {
      win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

ipcMain.handle("system:windowAction", (_event, action) => {
  const focused = BrowserWindow.getFocusedWindow();
  if (!focused) return;
  if (action === "minimize") focused.minimize();
  else if (action === "maximize") {
    if (focused.isMaximized()) focused.unmaximize();
    else focused.maximize();
  } else if (action === "close") focused.close();
});

ipcMain.handle("system:setTitleBarTheme", (_event, theme) => {
  const focused = BrowserWindow.getFocusedWindow();
  if (!focused) return;
  try {
    focused.setTitleBarOverlay({
      color: "#ffffff",
      symbolColor: "#0f172a",
      height: 38,
    });
  } catch {}
});

ipcMain.handle("secure:encrypt", (_event, value) => {
  if (!safeStorage.isEncryptionAvailable())
    throw new Error("OS secure storage unavailable");
  return safeStorage.encryptString(value).toString("base64");
});

ipcMain.handle("secure:decrypt", (_event, value) => {
  if (!safeStorage.isEncryptionAvailable())
    throw new Error("OS secure storage unavailable");
  return safeStorage.decryptString(Buffer.from(value, "base64"));
});

ipcMain.handle("system:getInstalledLicense", async () => {
  try {
    return protectedRead("license.json", null);
  } catch {}
  return null;
});

ipcMain.handle("system:saveInstalledLicense", async (_event, value) => {
  protectedWrite("license.json", value);
  return true;
});

ipcMain.handle("system:startGuestTrial", async (_event, fingerprint) => {
  const existing = protectedRead("guest-trial.lsstate", null);
  if (existing) return existing;
  const startedAt = new Date();
  const trial = {
    fingerprint,
    startedAt: startedAt.toISOString(),
    expiresAt: new Date(
      startedAt.getTime() + 72 * 60 * 60 * 1000,
    ).toISOString(),
  };
  protectedWrite("guest-trial.lsstate", trial);
  return trial;
});

ipcMain.handle("data:readLocal", async () =>
  protectedRead("business-data.lsdb", {
    version: 1,
    invoices: [],
    customers: [],
    products: [],
  }),
);

ipcMain.handle("data:writeLocal", async (_event, value) => {
  protectedWrite("business-data.lsdb", value);
  return true;
});

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.billiondue.invoice");
  }
  createWindow();
  app.on(
    "activate",
    () => BrowserWindow.getAllWindows().length === 0 && createWindow(),
  );
});
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
