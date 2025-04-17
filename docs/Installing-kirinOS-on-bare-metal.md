# Installing kirinOS on bare metal

> **WARNING:** kirinOS is currently in development and is not yet suitable for daily use. As such, the installation process will be complicated, and you might run into issues.

## Requirements

* 64bit x86 processor (the ARM port is not yet available)
* 2GB of RAM or more
* 8GB of storage or more
* Decent GPU
* Network card supported by Debian
* Ethernet connection (very important, Wi-Fi is not supported yet)
* Access to git.equestria.dev through your firewall (if applicable)
* Lot of time
* USB stick containing Debian 12 (no other version is supported)
* For better integration, it is recommended that you use a UEFI-based system, although these instructions will work with BIOS-based systems as well

## 1. Installing Debian
The first step into getting kirinOS up and running is to install Debian. Before you do anything, make sure your USB stick containing a copy of Debian 12 and your Ethernet cable are both plugged in. If your computer is running on battery, make sure it is sufficiently charged before continuing.

To install Debian (these instructions are for the "netinst" image):
* Turn on your computer and make it boot from the USB stick
* On the menu, choose "Install"
* Select "English" as the language
* Select your correct region (this is used to set up your timezone)
* Use "United States" as the locale
* Select the keymap you want to use; we recommend you leave it on "American English"
* Select the correct network card to use (if applicable)
* Use "kirinos" as the hostname
* Leave "Domain name" as the default value
* Use "kirinos" as the root password
* Name the new user "kirinOS" with the username "kirinos" and the password "kirinos"
* Partition your disk as you wish; if you want to erase the entire disk, use "Guided - use entire disk"
  * **Note:** Do NOT configure encryption here, kirinOS already comes with an encryption system that conflicts with LUKS.
* Make sure you have all files in the same partition, and that the resulting partition is at least 16GB
* Once the base installation is done, select the default mirror for your country, and configure a proxy if needed
* Select "No" on the package usage survey screen
* On the software selection screen, unselect "Debian desktop environment" as well as "GNOME" and select "SSH server", leave "standard system utilities" selected
* Install the GRUB bootloader on your system disk
* After the installation is complete, select "Go Back" and select "Execute a shell" and "Continue"
* Run `chroot /target`, and run `apt install -y git`
* Once you see the `#` symbol again, press Ctrl+D twice and select "Finish the installation"
* After everything is complete, select "Continue" and remove the USB stick while your system is restarting

## 2. Installing kirinOS
You have now installed Debian. Log in as `kirinos` with the password `kirinos`.

You now need to follow these instructions to install kirinOS:
* Run `su` and enter the password `kirinos`
* Run the following command:
  * `git clone https://git.equestria.dev/equestria.dev/kirinos /kirin`
* Wait for it to download kirinOS
* Run `cd /kirin`
* Run `chmod +x setup.sh`, and then `./setup.sh`
* You are now installing the required dependencies and configuring your Debian installation to run kirinOS. This will take a while, so take a break while it's working
  * You might get a few error messages about services not being found, this is normal.
* Once everything is done, open /etc/network/interfaces (`nano /etc/network/interfaces`) and remove the lines related to the primary network interface (usually starts with `enp0s`), then press Ctrl+S and Ctrl+Q to save and quit
* Run `/sbin/reboot` to restart the system
* If the screen turns green shortly after starting up, you have reached the first stage of the kirinOS startup process
* The screen may flicker a few times during the rest of the boot process
  * If you want technical details, the screen will flicker between each state of the boot process. Stage 1 is when the orange screen appears, stage 2 is when the screen resolution is set properly, and stage 3 is when the GUI is loaded
* Once the "Welcome to kirinOS" message appears, your system is installed properly
* After the boot process has completed, click on the "Owner" user and login using the "password" password
* Once you are logged in, you can click on the kirinOS logo in the top left corner and click on the "About" icon to check your system information

## Wrapping up
You now have kirinOS installed on bare metal, please report any issue you may encounter, so we can fix them before the final release.

If you wish to upgrade to a newer version of kirinOS, you will need to do the following:
* Press Ctrl+Q
* Run `cd /`
* Run `rm -rf /kirin`
  * **Note:** As upgrading is currently not supported, this will delete all of your user data
* Repeat all the steps mentioned in "2. Installing kirinOS" after the step about running `su`