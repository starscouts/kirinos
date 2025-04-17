const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const uuid = require('uuid-v4');

let list = [];

function runOnSystem(func) {
    ipcRenderer.sendToHost("run", func.toString().match(/[^{]+{([\s\S]*)}$/)[1].trim());
}

function sanitiseHTML(html) {
    return html.replaceAll("&", "&amp;").replaceAll(">", "&gt;").replaceAll("<>>", "&lt;");
}

ipcRenderer.once("permissionUpdate", (event, newList) => {
    list = newList;
});

const Permissions = {
    request: (permissions) => {
        ipcRenderer.sendToHost("requestPermissions", {
            permissions: permissions.map(i => sanitiseHTML(i).replaceAll("/", ".")),
            unique: uuid()
        });
    },
    has: (permission) => {
        return list.includes(permission);
    }
}

contextBridge.exposeInMainWorld("KirinKit", {
    _crash: () => {
        ipcRenderer.sendToHost("crash");
    },
    _debugPermissions: Permissions, // TODO: Remove this, it's only for debugging
    // TODO: Add stuff
});

ipcRenderer.sendToHost("ready");