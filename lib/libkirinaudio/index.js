const child_process = require("child_process");

class LibkirinaudioError extends Error {
    constructor(message, options) {
        super(message);

        for (let key of Object.keys(options)) {
            this[key] = options[key];
        }
    }
}

function cmd(name, args) {
    return new Promise((res, rej) => {
        let output = "";
        let proc = child_process.execFile(name, args, { stdio: "pipe" });

        proc.stdout.on('data', (data) => {
            output += data.toString();
        });

        proc.stderr.on('data', (data) => {
            output += data.toString();
        });

        proc.on('close', (code, signal) => {
            if (!code || code === 0) {
                res({
                    code,
                    signal,
                    output
                });
            } else {
                rej(new LibkirinaudioError(name + " command failed", {
                    code,
                    signal,
                    output
                }));
            }
        })
    });
}

function pacmd(...args) {
    return cmd("pacmd", args);
}

function pactl(...args) {
    return cmd("pactl", args);
}

function amixer(...args) {
    return cmd("amixer", args);
}

function parseFormat(format) {
    try {
        return {
            depth: parseInt(format[0].replace(/s(\d+)(.*)/gm, "$1")),
            endianness: format[0].replace(/s\d+(.*)/gm, "$1").trim() === "le" ? "LITTLE" : (format[0].replace(/s\d+(.*)/gm, "$1").trim() === "be" ? "BIG" : ""),
            channels: parseInt(format[1].split("ch")[0]),
            rate: parseInt(format[2].split("Hz")[0])
        }
    } catch (e) {
        return format;
    }
}

async function parseListing(listing, showMonitors) {
    let raw = (await pacmd("list-" + listing)).output;
    let sinks = {};
    let currentSink = null;
    let last = null;

    for (let line of raw.trim().split("\n")) {
        if (line.includes("index: ")) {
            last = null;
            currentSink = line.split("index: ")[1].trim();
            sinks[currentSink] = {
                default: line.includes(" * "),
                monitor: false,
                name: {
                    card: null,
                    internal: null,
                    driver: null,
                    display: null
                },
                volume: {
                    level: null,
                    muted: null,
                    balance: null
                },
                channels: {
                    map: null,
                    name: null
                }
            };
        } else if (line.match(/^\t[a-z-_ .]*: (.*)$/gm)) {
            let parts = line.replace(/^\t([a-z- .]*): (.*)$/gm, "$1||$2").split("||");

            if (parts[0].startsWith("\tmonitor_of: ")) {
                sinks[currentSink]["monitor"] = true;
                continue;
            }

            switch (parts[0]) {
                case "name":
                    sinks[currentSink]["name"]["internal"] = parts[1].replace(/<(.*)>/gm, "$1");
                    break;

                case "driver":
                    sinks[currentSink]["name"]["driver"] = parts[1].replace(/<(.*)>/gm, "$1");
                    break;

                case "flags":
                    sinks[currentSink]["flags"] = parts[1].trim().split(" ");
                    break;

                case "priority":
                    sinks[currentSink]["priority"] = parseInt(parts[1]);
                    break;

                case "state":
                    sinks[currentSink]["state"] = parts[1].trim();
                    break;

                case "channel map":
                    sinks[currentSink]["channels"]["map"] = parts[1].split(",");
                    break;

                case "muted":
                    sinks[currentSink]["volume"]["muted"] = parts[1].trim() === "yes";
                    break;

                case "fixed latency":
                    if (parts[1].endsWith(" ms")) {
                        sinks[currentSink]["latency"] = parseFloat(parts[1].split(" ")[0]);
                    }
                    break;

                case "volume":
                    let channels = parts[1].split(",").map(i => parseFloat(i.trim().split(":")[1].trim().split("/")[1].trim().split("%")[0]));
                    let average = channels.reduce((a, b) => a + b) / channels.length;

                    sinks[currentSink]["volume"]["level"] = average;

                    break;

                case "sample spec":
                    sinks[currentSink]["format"] = parseFormat(parts[1].trim().split(" "));
                    break;
            }

            last = parts[0];
        } else if (currentSink && last === "volume" && line.startsWith("\t        balance ")) {
            sinks[currentSink]["volume"]["balance"] = parseFloat(line.split(" balance ")[1].trim());
        } else if (currentSink && last === "channel map" && line.startsWith("\t             ")) {
            sinks[currentSink]["channels"]["name"] = line.trim();
        } else if (currentSink && line.startsWith("\t\t")) {
            let parts = line.replace(/^\t\t([a-z_\-.]*) = "(.*)"$/gm, "$1||$2").split("||").map(i => i.trim().split("\n")[0]);

            switch (parts[0]) {
                case "device.description":
                    sinks[currentSink]["name"]["display"] = parts[1];
                    break;

                case "alsa.card_name":
                    sinks[currentSink]["name"]["card"] = parts[1];
                    break;
            }
        }
    }

    if (!showMonitors) {
        for (let id of Object.keys(sinks)) {
            if (sinks[id]["monitor"]) {
                delete sinks[id];
            }
        }
    }

    return sinks;
}

const self = {
    getOutputs: async (showMonitors) => {
        return await parseListing("sinks", showMonitors ?? false);
    },
    getInputs: async (showMonitors) => {
        return await parseListing("sources", showMonitors ?? false);
    },
    getDefaultOutput: async () => {
        let list = await parseListing("sinks", false);
        return Object.values(list)[0];
    },
    getDefaultInput: async () => {
        let list = await parseListing("sources", false);
        return Object.values(list)[0];
    },
    setInputVolume: async (volume, input) => {
        if (typeof volume !== "number") return false;
        if (input && typeof input !== "number") return false;
        if (volume < 0 || volume > 100) return false;

        await pactl("set-source-volume", input ? input.toString() : "@DEFAULT_SOURCE@", volume + "%");
        return true;
    },
    setOutputVolume: async (volume, input) => {
        if (typeof volume !== "number") return false;
        if (input && typeof input !== "number") return false;
        if (volume < 0 || volume > 100) return false;

        await pactl("set-sink-volume", input ? input.toString() : "@DEFAULT_SINK@", volume + "%");
        return true;
    },
    setInputMuted: async (mute, input) => {
        if (typeof mute !== "boolean") return false;
        if (input && typeof input !== "number") return false;

        await pactl("set-source-mute", input ? input.toString() : "@DEFAULT_SOURCE@", mute ? "1" : "0");
        return true;
    },
    setOutputMuted: async (mute, input) => {
        if (typeof mute !== "boolean") return false;
        if (input && typeof input !== "number") return false;

        await pactl("set-sink-mute", input ? input.toString() : "@DEFAULT_SINK@", mute ? "1" : "0");
        return true;
    }
}

module.exports = self;