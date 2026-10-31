const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ledgerShield", {
  platform: "electron",
  protectSecret: (value) => ipcRenderer.invoke("secure:encrypt", value),
  revealSecret: (value) => ipcRenderer.invoke("secure:decrypt", value),
  getInstalledLicense: () => ipcRenderer.invoke("system:getInstalledLicense"),
  saveInstalledLicense: (value) =>
    ipcRenderer.invoke("system:saveInstalledLicense", value),
  startGuestTrial: (fingerprint) =>
    ipcRenderer.invoke("system:startGuestTrial", fingerprint),
  readLocalData: () => ipcRenderer.invoke("data:readLocal"),
  writeLocalData: (value) => ipcRenderer.invoke("data:writeLocal", value),
  windowAction: (action) => ipcRenderer.invoke("system:windowAction", action),
  setTitleBarTheme: (theme) => ipcRenderer.invoke("system:setTitleBarTheme", theme),
});

