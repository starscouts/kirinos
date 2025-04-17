const uuid = require('uuid-v4');
const path = require("path");
const crypto = require("crypto");

class WindowManager {
    #stack;
    #switcherStack;
    #list;
    #properties;

    constructor() {
        this.#stack = [];
        this.#switcherStack = [];
        this.#list = [];
        this.#properties = {};
    }

    #updateFocus() {
        this.#stack = [...new Set(this.#stack)].filter(i => i);
        this.#switcherStack = [...new Set(this.#switcherStack)].filter(i => i);
        let index = 0;

        for (let window of this.#stack) {
            let el = document.getElementById("window-" + window);
            if (!el || !window) {
                index++;
                continue;
            }

            el.style.zIndex = ((this.#stack.length - 1 - index) + 1).toString();

            if (index === 0 && el.classList.contains("window-inactive")) {
                // TODO: Broadcast a focus event to the client
                el.classList.remove("window-inactive");
            } else if (index !== 0 && !el.classList.contains("window-inactive")) {
                // TODO: Broadcast a blur event to the client
                el.classList.add("window-inactive");
            }

            index++;
        }

        document.getElementById("status").contentWindow.updateTitlebar();
    }

    getWindow(id) {
        let properties = this.#properties;

        return {
            get title() {
                return properties[id]["title"];
            },
            get minWidth() {
                return properties[id]["minWidth"];
            },
            get maxWidth() {
                return properties[id]["maxWidth"];
            },
            get width() {
                return properties[id]["width"];
            },
            get minHeight() {
                return properties[id]["minHeight"];
            },
            get maxHeight() {
                return properties[id]["maxHeight"];
            },
            get height() {
                return properties[id]["height"];
            },
            get x() {
                return properties[id]["x"];
            },
            get y() {
                return properties[id]["y"];
            },
            get movable() {
                return properties[id]["movable"];
            },
            get resizable() {
                return properties[id]["resizable"];
            },
            get closable() {
                return properties[id]["closable"];
            },
            get minimizable() {
                return properties[id]["minimizable"];
            },
            get maximizable() {
                return properties[id]["maximizable"];
            },
            get minimised() {
                return properties[id]["minimised"];
            },
            get maximised() {
                return properties[id]["maximised"];
            },

            set title(val) {
                if (typeof val !== "string") return;
                properties[id]["title"] = val;
                document.getElementById("window-" + id + "-titlebar-title").innerText = val;
            },
            set minWidth(val) {
                if (typeof val !== "number") return;
                properties[id]["minWidth"] = val;
            },
            set maxWidth(val) {
                if (typeof val !== "number") return;
                properties[id]["maxWidth"] = val;
            },
            set minHeight(val) {
                if (typeof val !== "number") return;
                properties[id]["minHeight"] = val;
            },
            set maxHeight(val) {
                if (typeof val !== "number") return;
                properties[id]["maxHeight"] = val;
            },
            set width(val) {
                if (typeof val !== "number") return;
                wm.resizeWindow(id, val, properties[id]["height"], properties[id]["x"], properties[id]["y"]);
            },
            set height(val) {
                if (typeof val !== "number") return;
                wm.resizeWindow(id, properties[id]["width"], val, properties[id]["x"], properties[id]["y"]);
            },
            set x(val) {
                if (typeof val !== "number") return;
                wm.moveWindow(id, val, properties[id]["y"]);
            },
            set y(val) {
                if (typeof val !== "number") return;
                wm.moveWindow(id, properties[id]["x"], val);
            },
            set movable(val) {
                if (typeof val !== "boolean") return;
                properties[id]["movable"] = val;
            },
            set resizable(val) {
                if (typeof val !== "boolean") return;
                properties[id]["resizable"] = val;

                if (val) {
                    document.getElementById("window-" + id + "-anchors").style.display = "none";
                } else {
                    document.getElementById("window-" + id + "-anchors").style.display = "";
                }
            },
            set closable(val) {
                if (typeof val !== "boolean") return;
                properties[id]["closable"] = val;


                if (val) {
                    document.getElementById("window-" + id + "-titlebar-control-close").classList.add("window-titlebar-control-disabled");
                } else {
                    document.getElementById("window-" + id + "-titlebar-control-close").classList.add("window-titlebar-control-disabled");
                }
            },
            set debuggable(val) {
                if (typeof val !== "boolean") return;
                properties[id]["debuggable"] = val;

                if (val) {
                    document.getElementById("window-" + id + "-titlebar-control-devtools").style.display = "none";
                } else {
                    document.getElementById("window-" + id + "-titlebar-control-devtools").style.display = "inline-block";
                }
            },
            set maximizable(val) {
                if (typeof val !== "boolean") return;
                properties[id]["maximizable"] = val;

                if (val) {
                    document.getElementById("window-" + id + "-titlebar-control-maximise").classList.add("window-titlebar-control-disabled");
                } else {
                    document.getElementById("window-" + id + "-titlebar-control-maximise").classList.add("window-titlebar-control-disabled");

                    wm.restoreWindow(id);
                }
            },
            set minimizable(val) {
                if (typeof val !== "boolean") return;
                properties[id]["minimizable"] = val;

                if (val) {
                    document.getElementById("window-" + id + "-titlebar-control-minimise").classList.add("window-titlebar-control-disabled");
                } else {
                    document.getElementById("window-" + id + "-titlebar-control-minimise").classList.add("window-titlebar-control-disabled");

                    wm.unminimiseWindow(id);
                }
            },
            set minimised(val) {
                if (typeof val !== "boolean") return;

                if (val) {
                    wm.minimiseWindow(id);
                } else {
                    wm.unminimiseWindow(id);
                }
            },
            set maximised(val) {
                if (typeof val !== "boolean") return;

                if (val) {
                    wm.maximiseWindow(id);
                } else {
                    wm.restoreWindow(id);
                }
            },
        };
    }

    createWindow(options) {
        return new Promise((res, rej) => {
            let id = uuid();

            this.#properties[id] = {
                title: options['title'] ?? "(none)",
                application: options['application'] ?? null,
                isolatedPath: options['isolatedPath'] ?? "",
                frameless: options['frameless'] ?? false,
                rounded: options['rounded'] ?? false,
                minWidth: options['minWidth'] ?? 64,
                minHeight: options['minHeight'] ?? 64,
                maxWidth: options['maxWidth'] ?? Infinity,
                maxHeight: options['maxHeight'] ?? Infinity,
                width: options['width'] ?? 256,
                height: options['height'] ?? 256,
                x: options['x'] ?? 0,
                y: options['y'] ?? 0,
                centered: options['centered'] ?? true,
                movable: options['movable'] ?? true,
                closable: options['closable'] ?? true,
                maximizable: options['maximizable'] ?? true,
                minimizable: options['minimizable'] ?? true,
                debuggable: options['debuggable'] ?? false,
                resizable: options['resizable'] ?? true,
                minimised: options['minimised'] ?? false,
                maximised: options['maximised'] ?? false
            }

            if (this.#properties[id].centered) {
                this.#properties[id]['x'] = window.innerWidth / 2 - this.#properties[id]['width'] / 2;
                this.#properties[id]['y'] = window.innerHeight / 2 - this.#properties[id]['height'] / 2;
            }

            document.getElementById("window-container").insertAdjacentHTML("beforeend", `
        <div onmousedown="wm.focusWindow('${id}');" class="window ${this.#properties[id]['frameless'] ? "window-frameless" : ""} ${this.#properties[id]['rounded'] ? "window-rounded" : ""}" id="window-${id}" style="width: ${this.#properties[id]['width']}px; height: ${this.#properties[id]['height']}px; top: ${this.#properties[id]['y']}px; left: ${this.#properties[id]['x']}px;">
            <div class="window-titlebar ${this.#properties[id]['frameless'] ? "window-titlebar-frameless" : ""}" id="window-${id}-titlebar">
                <div class="window-titlebar-controls" id="window-${id}-titlebar-controls">
                    <a onclick="wm.closeWindow('${id}');" class="window-titlebar-control window-titlebar-control-close ${!this.#properties[id]['closable'] ? "window-titlebar-control-disabled" : ""}" id="window-${id}-titlebar-control-close" style="padding: 4px; vertical-align: middle; width: 24px; height: 24px; display: inline-block;border-top-left-radius: 7px;">
                        <img src="./icons/close.svg" style="width: 24px; vertical-align: middle;">
                    </a><a onclick="wm.toggleMinimisedWindow('${id}');" class="window-titlebar-control window-titlebar-control-minimise ${!this.#properties[id]['minimizable'] ? "window-titlebar-control-disabled" : ""}" id="window-${id}-titlebar-control-minimise" style="padding: 4px; vertical-align: middle; width: 24px; height: 24px; display: inline-block;">
                        <img src="./icons/minimise.svg" style="width: 24px; vertical-align: middle;">
                    </a><a onclick="wm.toggleMaximisedWindow('${id}');" class="window-titlebar-control window-titlebar-control-maximise ${!this.#properties[id]['maximizable'] ? "window-titlebar-control-disabled" : ""}" id="window-${id}-titlebar-control-maximise" style="padding: 4px; vertical-align: middle; width: 24px; height: 24px; display: inline-block;">
                        <img src="./icons/maximise.svg" style="width: 24px; vertical-align: middle;">
                    </a>${this.#properties[id]['debuggable'] ? `<a onclick="wm.toggleDevTools('${id}');" class="window-titlebar-control window-titlebar-control-devtools" id="window-${id}-titlebar-control-devtools" style="padding: 4px; vertical-align: middle; width: 24px; height: 24px; display: inline-block;">
                        <img src="./icons/devtools.svg" style="width: 24px; vertical-align: middle;">
                    </a>` : ``}
                </div>
                <div class="window-titlebar-title" id="window-${id}-titlebar-title" style="white-space: nowrap;overflow: hidden !important;text-overflow: ellipsis;">${this.#properties[id]['title']}</div>
            </div>
            <div class="window-contents" id="window-${id}-contents" style="height: calc(100% - 33px);">
                <webview partition="${id}" id="window-${id}-contents-webview" class="window-contents-webview" style="display: flex; height: 100%; width: 100%;" src="${options['url']}" preload="file:///kirin/lib/kirinkit/index.js" ${options['sandbox'] === false ? "nodeintegration webpreferences=\"contextIsolation=no,sandbox=no\"" : "webpreferences=\"sandbox=no\""}></webview>
            </div>
            ${this.#properties[id]['resizable'] ? `
            <div class="window-anchors" id="window-${id}-anchors">
                <div class="window-anchor window-anchor-top-left"></div>
                <div class="window-anchor window-anchor-top-right"></div>
                <div class="window-anchor window-anchor-bottom-left"></div>
                <div class="window-anchor window-anchor-bottom-right"></div>
            </div>
            ` : ''}
        </div>
        `);

            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            
            function proceed(i) {
                let c = setInterval(() => {
                    if (document.getElementById("window-" + id + "-contents-webview").getWebContentsId) {
                        clearInterval(c);
                        let webContents = i.#properties[id].webContents = require("@electron/remote").webContents.fromId(document.getElementById("window-" + id + "-contents-webview").getWebContentsId());

                        let isolatedPath = encodeURI(i.#properties[id].isolatedPath);
                        let name = i.#properties[id]['application'] ?? i.#properties[id]['title'];
                        let appId = crypto.createHash("sha1").update(isolatedPath).digest("hex");

                        if (!fs.existsSync("/kirin/session/config/permissions")) fs.mkdirSync("/kirin/session/config/permissions");
                        if (!fs.existsSync("/kirin/session/config/permissions/" + appId + ".json")) fs.writeFileSync("/kirin/session/config/permissions/" + appId + ".json", JSON.stringify({
                            allowed: [],
                            rejected: []
                        }));

                        let permissions = JSON.parse(fs.readFileSync("/kirin/session/config/permissions/" + appId + ".json").toString());
                        console.log(permissions);

                        document.getElementById("window-" + id + "-contents-webview").addEventListener('page-title-updated', (event) => {
                            console.info("Updated title for " + id + ": " + event['title'] + " (" + event['explicitSet'] + ")");

                            if (event['explicitSet']) {
                                wm.getWindow(id).title = event['title'];
                            } else {
                                wm.getWindow(id).title = name;
                            }
                        });

                        document.getElementById("window-" + id + "-contents-webview").addEventListener('ipc-message', (event) => {
                            if (event.channel === "crash") {
                                wm.closeWindow(id);
                                document.getElementById("full-message-crash-app").innerText = name;
                                Array.from(document.getElementsByClassName("full-message-item")).forEach(i => i.style.display = "none");
                                document.getElementById("full-message-crash").style.display = "";
                                document.getElementById("full-message").style.display = "";
                            } else if (event.channel === "ready") {
                                document.getElementById("window-" + id + "-contents-webview").send("permissionUpdate", permissions['allowed']);
                            } else if (event.channel === "run") {
                                eval(event.args[0]);
                            } else if (event.channel === "requestPermissions") {
                                try {
                                    window.currentPermissionsRequest = {
                                        accept: () => {
                                            document.getElementById('full-message').style.display = 'none';

                                            for (let permission of event.args[0]['permissions']) {
                                                if (!permissions['allowed'].includes(permission)) permissions['allowed'].push(permission);
                                            }

                                            fs.writeFileSync("/kirin/session/config/permissions/" + appId + ".json", JSON.stringify(permissions));

                                            document.getElementById("window-" + id + "-contents-webview").send("permissionUpdate", permissions['allowed']);
                                        },
                                        reject: (force) => {
                                            document.getElementById('full-message').style.display = 'none';

                                            if (force) {
                                                for (let permission of event.args[0]['permissions']) {
                                                    if (!permissions['rejected'].includes(permission)) permissions['rejected'].push(permission);
                                                }

                                                fs.writeFileSync("/kirin/session/config/permissions/" + appId + ".json", JSON.stringify(permissions));
                                            }
                                        }
                                    }

                                    if (document.getElementById("full-message").style.display === "") return;

                                    let permList = JSON.parse(fs.readFileSync("./core/desktop/permissions.json").toString());
                                    let list = event.args[0]['permissions'].filter(i => !permissions['rejected'].includes(i) && !permissions['allowed'].includes(i));

                                    if (list.length > 0) {
                                        document.getElementById("full-message-permissions-app").innerText = name;
                                        document.getElementById("full-message-permissions-list").innerHTML = list.map(i => `
                                        <div class="permission" style="display: grid; grid-template-columns: 32px 1fr; grid-gap: 10px; margin-bottom: 10px;">
                                            <div style="display: flex; align-items: center; justify-content: center;">
                                                <img src="./permissions/${fs.existsSync("./core/desktop/permissions/" + i + ".svg") ? i : "default"}.svg" alt="" style="width: 32px; height: 32px;">
                                            </div>
                                            <div>
                                                <b>${permList[i] ? permList[i]['name'] : i}</b><br>${permList[i] ? permList[i]['description'] : ""}
                                            </div>
                                        </div>
                                    `).join("");
                                        Array.from(document.getElementsByClassName("full-message-item")).forEach(i => i.style.display = "none");
                                        document.getElementById("full-message-permissions").style.display = "";
                                        document.getElementById("full-message").style.display = "";
                                    }
                                } catch (e) {
                                    console.error(e);
                                    wm.closeWindow(id);
                                    document.getElementById("full-message-crash-app").innerText = name;
                                    Array.from(document.getElementsByClassName("full-message-item")).forEach(i => i.style.display = "none");
                                    document.getElementById("full-message-crash").style.display = "";
                                    document.getElementById("full-message").style.display = "";
                                }
                            }
                        });

                        webContents.session.on('will-download', (event, item, webContents) => {
                            item.cancel()
                        });

                        webContents.setWindowOpenHandler((details) => {
                            return {
                                action: 'deny'
                            };
                        });

                        webContents.on('devtools-opened', () => {
                            webContents.devToolsWebContents.focus();
                        });

                        let systemPath = "/kirin/shared";

                        webContents.session.webRequest.onBeforeRequest({
                            urls: [
                                "file://*/*",
                                "http://*/*",
                                "https://*/*",
                                "ws://*/*",
                                "wss://*/*"
                            ]
                        }, (details, cb) => {
                            if (details.url.startsWith("file://") && !details.url.startsWith("file://" + isolatedPath + "/") && !details.url.startsWith("file://" + systemPath + "/")) {
                                console.error("Prevented " + id + " from accessing " + details.url + ", application is limited to files within file://" + isolatedPath + "/");

                                cb({
                                    cancel: true
                                });
                            } else if (details.url.startsWith("file:///app/")) {
                                if (path.resolve(isolatedPath + details.url.substring(11)).startsWith(isolatedPath + "/")) {
                                    console.info("Serving " + id + " with " + details.url);

                                    cb({
                                        redirectURL: "file://" + isolatedPath + details.url.substring(6)
                                    });
                                } else {
                                    console.error("Prevented " + id + " from accessing " + details.url + ", application is limited to files within file://" + isolatedPath + "/");

                                    cb({
                                        cancel: true
                                    });
                                }
                            } else if (details.url.startsWith("file://" + isolatedPath + "/")) {
                                if (path.resolve(isolatedPath + details.url.substring(7)).startsWith(isolatedPath + "/")) {
                                    console.info("Serving " + id + " with " + details.url);

                                    cb({
                                        cancel: false
                                    });
                                } else {
                                    console.error("Prevented " + id + " from accessing " + details.url + ", application is limited to files within file://" + isolatedPath + "/");

                                    cb({
                                        cancel: true
                                    });
                                }
                            } else if (details.url.startsWith("file://" + systemPath + "/")) {
                                if (path.resolve(systemPath + details.url.substring(7)).startsWith(systemPath + "/")) {
                                    console.info("Serving " + id + " with " + details.url);

                                    cb({
                                        cancel: false
                                    });
                                } else {
                                    console.error("Prevented " + id + " from accessing " + details.url + ", application is limited to files within file://" + isolatedPath + "/");

                                    cb({
                                        cancel: true
                                    });
                                }
                            } else if (details.url.startsWith("app://")) {
                                if (path.resolve(isolatedPath + details.url.substring(6)).startsWith(isolatedPath + "/")) {
                                    console.error("Serving " + id + " with " + details.url);

                                    cb({
                                        redirectURL: "file://" + isolatedPath + details.url.substring(6)
                                    });
                                } else {
                                    console.error("Prevented " + id + " from accessing " + details.url);

                                    cb({
                                        cancel: true
                                    });
                                }
                            } else if (details.url.startsWith("shared://")) {
                                if (path.resolve(systemPath + details.url.substring(6)).startsWith(systemPath + "/")) {
                                    console.error("Serving " + id + " with " + details.url);

                                    cb({
                                        redirectURL: "file://" + systemPath + details.url.substring(6)
                                    });
                                } else {
                                    console.error("Prevented " + id + " from accessing " + details.url);

                                    cb({
                                        cancel: true
                                    });
                                }
                            } else if (details.url.startsWith("http://") || details.url.startsWith("https://") || details.url.startsWith("ws://") || details.url.startsWith("wss://")) {
                                console.error("Prevented " + id + " from accessing " + details.url + ", application does not have internet access");

                                cb({
                                    cancel: true
                                });
                            } else {
                                console.error("Prevented " + id + " from accessing " + details.url + ", unknown request");

                                cb({
                                    cancel: true
                                });
                            }
                        });

                        document.getElementById("window-" + id + "-titlebar-title").onmousedown = (e) => {
                            document.querySelector('#window-' + id + ' .window-contents-webview').style.pointerEvents = "none";

                            e.preventDefault();
                            pos3 = e.clientX;
                            pos4 = e.clientY;

                            document.onmouseup = () => {
                                document.onmouseup = null;
                                document.onmousemove = null;
                                document.querySelector('#window-' + id + ' .window-contents-webview').style.pointerEvents = "";
                            }

                            document.onmousemove = (e) => {
                                e.preventDefault();
                                pos1 = pos3 - e.clientX;
                                pos2 = pos4 - e.clientY;
                                pos3 = e.clientX;
                                pos4 = e.clientY;

                                i.moveWindow(id, document.getElementById("window-" + id).offsetLeft - pos1, document.getElementById("window-" + id).offsetTop - pos2);
                            }
                        }

                        if (i.#properties[id].resizable) {
                            const resizers = document.querySelectorAll('#window-' + id + ' .window-anchor');
                            const element = document.getElementById("window-" + id);

                            const minimum_size_x = i.#properties[id].minWidth;
                            const minimum_size_y = i.#properties[id].minHeight;
                            let original_width = 0;
                            let original_height = 0;
                            let original_x = 0;
                            let original_y = 0;
                            let original_mouse_x = 0;
                            let original_mouse_y = 0;

                            for (let i = 0; i < resizers.length; i++) {
                                const currentResizer = resizers[i];
                                currentResizer.addEventListener('mousedown', function (e) {
                                    document.querySelector('#window-' + id + ' .window-contents-webview').style.pointerEvents = "none";

                                    e.preventDefault()
                                    original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
                                    original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
                                    original_x = element.getBoundingClientRect().left;
                                    original_y = element.getBoundingClientRect().top;
                                    original_mouse_x = e.pageX;
                                    original_mouse_y = e.pageY;
                                    window.addEventListener('mousemove', resize)
                                    window.addEventListener('mouseup', stopResize)
                                })

                                function resize(e) {
                                    if (currentResizer.classList.contains('window-anchor-bottom-right')) {
                                        const width = original_width + (e.pageX - original_mouse_x);
                                        const height = original_height + (e.pageY - original_mouse_y)

                                        wm.resizeWindow(id, width, height, null, null);
                                    } else if (currentResizer.classList.contains('window-anchor-bottom-left')) {
                                        const height = original_height + (e.pageY - original_mouse_y)
                                        const width = original_width - (e.pageX - original_mouse_x)

                                        wm.resizeWindow(id, width, height, original_x + (e.pageX - original_mouse_x), null);
                                    } else if (currentResizer.classList.contains('window-anchor-top-right')) {
                                        const width = original_width + (e.pageX - original_mouse_x)
                                        const height = original_height - (e.pageY - original_mouse_y)

                                        wm.resizeWindow(id, width, height, null, original_y + (e.pageY - original_mouse_y));
                                    } else {
                                        const width = original_width - (e.pageX - original_mouse_x)
                                        const height = original_height - (e.pageY - original_mouse_y)

                                        wm.resizeWindow(id, width, height, original_x + (e.pageX - original_mouse_x), original_y + (e.pageY - original_mouse_y));
                                    }
                                }

                                function stopResize() {
                                    if (document.querySelector('#window-' + id + ' .window-contents-webview')) document.querySelector('#window-' + id + ' .window-contents-webview').style.pointerEvents = "";
                                    window.removeEventListener('mousemove', resize)
                                }
                            }
                        }

                        i.#stack.unshift(id);
                        i.#switcherStack.unshift(id);
                        i.#list.push(id);

                        i.#updateFocus();

                        res();
                    }
                });

                document.getElementById("window-" + id + "-contents-webview").removeEventListener('dom-ready', () => {
                    proceed(this);
                });
            }

            document.getElementById("window-" + id + "-contents-webview").addEventListener('dom-ready', () => {
                proceed(this);
            });
        });
    }

    moveWindow(id, x, y) {
        if (!this.#properties[id].movable) return;

        if (y < 32) return;
        if (y > window.innerHeight - 32) return;
        if (x < 32) return;
        if (x > window.innerWidth - 128) return;

        this.#properties[id].x = x;
        this.#properties[id].y = y;

        document.getElementById("window-" + id).style.top = y + "px";
        document.getElementById("window-" + id).style.left = x + "px";

        // TODO: Broadcast a move event to the client
    }

    resizeWindow(id, width, height, x, y) {
        if (width > this.#properties[id].minWidth && width > 96 && ((this.#properties[id].maxWidth > 0 && width < this.#properties[id].maxWidth) || this.#properties[id].maxWidth < 0) && width < window.innerWidth) {
            this.#properties[id].width = width;
            document.getElementById("window-" + id).style.width = width + 'px';

            if (x) {
                this.#properties[id].x = x;
                document.getElementById("window-" + id).style.left = x + "px";
            }
        }

        if (height > this.#properties[id].minHeight && height > 64 && ((this.#properties[id].maxHeight > 0 && height < this.#properties[id].maxHeight) || this.#properties[id].maxHeight < 0) && height < window.innerHeight) {
            this.#properties[id].height = height;
            document.getElementById("window-" + id).style.height = height + 'px'

            if (y) {
                this.#properties[id].y = y;
                document.getElementById("window-" + id).style.top = y + "px";
            }
        }

        // TODO: Broadcast a resize event to the client
    }

    closeWindow(id) {
        document.getElementById("window-" + id).outerHTML = "";
        delete this.#stack[this.#stack.indexOf(id)];
        delete this.#switcherStack[this.#switcherStack.indexOf(id)];
        delete this.#list[this.#list.indexOf(id)];
        delete this.#properties[id];
        this.#updateFocus();

        document.getElementById("status").contentWindow.updateTitlebar();

        // TODO: Broadcast a close event to the client
    }

    toggleMinimisedWindow(id) {
        if (document.getElementById("window-" + id).classList.contains("window-minimised")) {
            wm.unminimiseWindow(id);
        } else {
            wm.minimiseWindow(id);
        }
    }

    unminimiseWindow(id) {
        if (!document.getElementById("window-" + id).classList.contains("window-minimised")) return;
        document.getElementById("window-" + id).classList.remove("window-minimised");
        this.#stack.unshift(id);
        this.#updateFocus();
        this.#properties[id].minimised = false;

        document.getElementById("status").contentWindow.updateTitlebar();

        // TODO: Broadcast an unminimise event to the client
    }

    minimiseWindow(id) {
        if (document.getElementById("window-" + id).classList.contains("window-minimised")) return;
        document.getElementById("window-" + id).classList.add("window-minimised");
        delete this.#stack[this.#stack.indexOf(id)];
        delete this.#switcherStack[this.#switcherStack.indexOf(id)];
        this.#switcherStack.splice(2, 0, id);

        this.#updateFocus();
        this.#properties[id].minimised = true;

        document.getElementById("status").contentWindow.updateTitlebar();

        // TODO: Broadcast a minimise event to the client
    }

    toggleDevTools(id) {
        if (!this.#properties[id].webContents) return;
        document.getElementById("window-" + id + "-contents-webview").closeDevTools();
        document.getElementById("window-" + id + "-contents-webview").openDevTools();
    }

    focusWindow(id) {
        if (document.getElementById("window-" + id).classList.contains("window-minimised")) wm.unminimiseWindow(id);
        if (!document.getElementById("window-" + id).classList.contains("window-inactive")) return;
        delete this.#stack[this.#stack.indexOf(id)];
        delete this.#switcherStack[this.#switcherStack.indexOf(id)];
        this.#stack.unshift(id);
        this.#switcherStack.unshift(id);
        this.#updateFocus();

        // TODO: Broadcast a focus event to the client
    }

    toggleMaximisedWindow(id) {
        if (document.getElementById("window-" + id).classList.contains("window-maximised")) {
            wm.restoreWindow(id);
        } else {
            wm.maximiseWindow(id);
        }
    }

    restoreWindow(id) {
        if (!document.getElementById("window-" + id).classList.contains("window-maximised")) return;
        document.getElementById("window-" + id).classList.remove("window-maximised");
        document.getElementById("window-" + id + "-titlebar-control-maximise").children[0].src = "./icons/maximise.svg";
        this.#properties[id].maximised = false;

        // TODO: Broadcast a restore AND a resize event to the client
    }

    maximiseWindow(id) {
        if (document.getElementById("window-" + id).classList.contains("window-maximised")) return;
        document.getElementById("window-" + id).classList.add("window-maximised");
        document.getElementById("window-" + id + "-titlebar-control-maximise").children[0].src = "./icons/restore.svg";
        this.#properties[id].maximised = true;

        // TODO: Broadcast a maximise AND a resize event to the client
    }

    getTaskbarItems() {
        return Object.keys(this.#properties).map((id) => {
            let win = this.#properties[id];

            return {
                id,
                title: win.title,
                minimised: win.minimised,
                focused: !document.getElementById("window-" + id).classList.contains("window-inactive") && !document.getElementById("window-" + id).classList.contains("window-minimised"),
                application: win.isolatedPath ?? null
            }
        });
    }

    getSwitcherItems() {
        let list = [];

        for (let id of this.#switcherStack) {
            let win = this.#properties[id];

            list.push({
                id,
                title: win.title,
                minimised: win.minimised,
                focused: !document.getElementById("window-" + id).classList.contains("window-inactive") && !document.getElementById("window-" + id).classList.contains("window-minimised"),
                application: win.isolatedPath ?? null
            });
        }

        return list;
    }

    taskbarAction(id) {
        if (document.getElementById("window-" + id).classList.contains("window-minimised")) {
            this.unminimiseWindow(id);
        } else if (document.getElementById("window-" + id).classList.contains("window-inactive")) {
            this.focusWindow(id);
        } else if (this.#properties[id].minimizable) {
            this.minimiseWindow(id);
        }
    }
}