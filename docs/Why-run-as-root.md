# Why run as `root`?

The kirinOS system software runs as `root` on the underlying Linux system. While you might argue this is insecure and puts users at an unnecessary risk, using the `root` user is perfectly justified.

1. All the applications running on kirinOS are running in a sandbox, except for a few system applications (e.g. System Settings). This means they don't have access to the underlying system at all; they don't even have access to core kirinOS components. As long as the sandbox used in Chromium is not compromised, the OS remains secure.

2. Using another user would be as insecure, because privilege elevation would be required for some system components to run (e.g. `libmangoaudio`). While we could have a special program that can run only a few specific commands; or only use `sudo`, this would be inconvenient and make programming with kirinOS more difficult.

3. Not running as `root` will break some system extensions. System extensions expect to have full system access, so that they can, for example, provide a file system driver. Using a system such as the one mentioned in #2 would mean system modifications are required when installing system extensions, effectively reducing some of their "extension" sense.

In a future version, we might implement a better solution that makes use of another user, although this is yet to be done. Until then, do not worry about the security of kirinOS as long as you make sure to install updates as they are made available.