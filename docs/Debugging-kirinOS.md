# Debugging kirinOS

kirinOS runs on Electron, which is a framework to use Web technologies to build native applications. kirinOS has little to no debugging infrastructure other than what Electron provides.

## Debugging the OS itself

> **IMPORTANT SECURITY NOTICE:** These options are for debugging and debugging **ONLY**. If anyone, even a kirinOS developer, asks you to enter code in Chrome Dev Tools, make sure you **ABSOLUTELY** know what this code does before executing it.

The following keyboard shortcuts are available to debug kirinOS:
* `Ctrl+Alt+N`: cycle through the open Chrome Dev Tools windows
  * Warning: In revision 8a896f6bc2 and earlier, the shortcut is `Ctrl+Alt+Tab`
  * Note: `Alt+Tab` alone is used to cycle through kirinOS windows after revision 8a896f6bc2
* `Ctrl+Shift+I`: open Chrome Dev Tools for the main kirinOS window
* `Ctrl+R`: reload the main kirinOS window
* `Ctrl+Q`: exit kirinOS and open a `root` terminal

## Debugging applications

kirinOS comes with options to debug your applications. You can set the `debuggable` option in your application's metadata to add a debugging option to the title bar that, when clicked, opens Chrome Dev Tools for this application.