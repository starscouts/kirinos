# mangoOS is now kirinOS

During the development cycle, we have renamed mangoOS to kirinOS. The new name is easier to pronounce in all languages and looks nicer to the eye. The change should be applied completely before the final release. However, such a change can have consequences that early adopters need to consider:

* If you have followed instructions to run mangoOS on bare metal or on a Raspberry Pi, you will need to reinstall the entire system again; updating is not officially supported.
* Apps made for mangoOS might not work on kirinOS, the OS that was installed under `/mango` is now installed under `/kirin`, and `MangoKit` is now `KirinKit`.
* Some default user settings have changed. This includes the OS logo and the default wallpaper.

If you encounter issues after the name has changed, feel free to report them to our bug tracker at https://bugs.equestria.dev. Thanks for trying kirinOS.

----

If you want to try upgrading from mangoOS to kirinOS anyway, here are the instructions:
* Press Ctrl+Q
* Run `cd /`
* Run `rm -rf /mango`
  * **Note:** This will delete all of your user data
* Follow the steps from the "Installing kirinOS" section corresponding to your hardware