function _showWarning(version, name) {
    console.log("%c _    _      _        ___  ____\n" +
        "| | _(_)_ __(_)_ __  / _ \\/ ___|\n" +
        "| |/ / | '__| | '_ \\| | | \\___ \\\n" +
        "|   <| | |  | | | | | |_| |___) |\n" +
        "|_|\\_\\_|_|  |_|_| |_|\\___/|____/\n" +
        "\n%c" + version + "\n\n------------------------------\n\n%cHere be dragons!\n%c(I'm not talking about Sparky)\n%c<!> READ THIS CAREFULLY. <!>\n%cThis is the " + name + " developer console. It runs %ccompletely unisolated%c and has %cfull hardware access%c. If you were asked to run code inside of this console, %cDO NOT DO THIS%c. You have been warned.\n", "opacity: 1; color: #90a14a; font-weight: bold;", "opacity: .5;", "color: red; font-size: 24px; margin-bottom: 10px;", "opacity: .25; font-size: 10px; margin-bottom: 10px;", "opacity: 1; color: yellow; background-color: red; font-size: 20px; margin-bottom: 10px;", "font-size: 14px; ", "font-size: 14px; font-weight: bold;", "font-size: 14px; ", "font-size: 14px; font-weight: bold;", "font-size: 14px; ", "font-size: 14px; font-weight: bold;", "font-size: 14px; ");
}

try {
    require('fs').promises.readFile("/kirin/release.json").then((b) => {
        let data = JSON.parse(b.toString());
        _showWarning(data['name'] + ", Build " + data['build'], data['name']);
    })
} catch (e) {
    _showWarning("-", "kirinOS");
}