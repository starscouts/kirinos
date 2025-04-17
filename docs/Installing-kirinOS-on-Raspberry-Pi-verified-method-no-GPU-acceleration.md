# Installing kirinOS on Raspberry Pi (verified method, no GPU acceleration)

> **WARNING:** kirinOS is currently in development and is not yet suitable for daily use. As such, the installation process will be complicated, and you might run into issues. Additionally, **kirinOS on ARM is not supported and may permanently damage your device**, please proceed with caution.

> **Note:** The ARM port of kirinOS is meant to be used on Equestria.dev's own "Kirinbox" and "Kirinbook" devices; for consumer use, prefer to use the x86 version

## Requirements

* Raspberry Pi 4 or later
* 2GB of RAM or more
* 8GB (or larger) SD card
* Ethernet connection (very important, Wi-Fi is not supported yet)
* Micro HDMI to HDMI cable
  * **Note:** Using a screen larger than 1080p may cause performance issues on Raspberry Pi 4
* Keyboard and mouse
* Access to git.equestria.dev through your firewall (if applicable)
* Lot of time
* USB stick containing the ARM64 version of Debian 12 (no other version is supported)

## 1. Installing UEFI firmware
The bootloader Raspberry Pi used by default does not support UEFI programs. Therefore, we need to install UEFI firmware onto the Raspberry Pi.

To do this, follow the following steps:
* Go to https://github.com/pftf/RPi4/releases and download the latest available version (at the time of writing, it is 1.35)
* Insert your SD card into your computer and format it as a GPT disk so that you have a 16 MB (or larger) FAT32 partition named "BOOT" at the start of the disk, and an empty space for the rest of the disk
* Mount the first partition and copy the files from the UEFI firmware to it
* Plug the SD card into your Raspberry Pi
* Once you see a Raspberry Pi logo on the screen, press Esc to open the setup menu
* Once you are in the setup menu, select Reset, and make sure you see the Raspberry Pi logo again
* Make sure nothing happens after the bar is filled, meaning there is no boot device available
* Unplug the Raspberry Pi

You have now successfully installed UEFI firmware onto this Raspberry Pi, you may now plug in the rest of your devices and proceed with the rest of the guide.

## 2. Installing Debian
The first step into getting kirinOS up and running is to install Debian. Before you do anything, make sure your USB stick containing a copy of Debian 12 and your Ethernet cable are both plugged in. If your computer is running on battery, make sure it is sufficiently charged before continuing.

If you haven't already, you can download an ARM64 Debian ISO here: https://cdimage.debian.org/debian-cd/current/arm64/iso-cd/

To install Debian (these instructions are for the "netinst" image):
* Plug in the Raspberry Pi again
* Once the Raspberry Pi logo appears, press Esc
* In the setup menu, go to "Boot manager" and select your USB stick
* On the menu, choose "Install"
* Select "English" as the language
* Select your correct region (this is used to set up your timezone)
* Use "United States" as the locale
* Select the keymap you want to use; we recommend you leave it on "American English"
* If you get a screen telling you to use removable media to load missing firmware, select "No" (this is for the Wi-Fi adapter, which we do not use)
* Use "kirinos" as the hostname
* Leave "Domain name" as the default value
* Use "kirinos" as the root password
* Name the new user "kirinOS" with the username "kirinos" and the password "kirinos"
* Select "Guided - use the largest continuous free space" on the partition screen
* Make sure you have all files in the same partition, and that the resulting partition is at least 16GB
* Once the base installation is done, select the default mirror for your country, and configure a proxy if needed
* Select "No" on the package usage survey screen
* On the software selection screen, make sure "Debian desktop environment" as well as "GNOME" are unselected, and that "SSH server" and "standard system utilities" are selected
* After the installation is complete, select "Go Back" and select "Execute a shell" and "Continue"
* Run `chroot /target`, and run `apt install -y git npm`
* Once you see the `#` symbol again, press Ctrl+D twice and select "Finish the installation"
* After everything is complete, select "Continue" and remove the USB stick while your system is restarting
* When you see the Raspberry Pi logo again, press Esc to go to the setup menu
* Go to Boot Maintenance Manager > Boot Options > Change Boot Order > Change the order
* Go over to "SD/MMC" and press + until it's at the top of the list, then press Enter
* Press Esc 3 times, then go to Device Manager > Raspberry Pi Configuration > SD/MMC Configuration and change uSD/eMMC Routing to "Arasan SDHCI"
* Press F10 and Y, then press Esc 3 times, then choose Reset
* Once you see the Raspberry Pi logo again, unplug your Raspberry Pi and plug the SD card back into your computer
* Mount the EFI system partition
* Create a new folder in the EFI folder named BOOT
* Copy the grubaa64.efi, fbaa64.efi and mmaa64.efi files from the "debian" folder into the "BOOT" folder
* Rename the grubaa64.efi file in the BOOT folder to BOOTAA64.EFI
* Unmount the SD card, plug it back into your Raspberry Pi, and plug the Raspberry Pi back in
* If you have done everything properly, your Raspberry Pi should boot into Debian

## 3. Installing kirinOS
You have now installed Debian. Log in as `kirinos` with the password `kirinos`.

You now need to follow these instructions to install kirinOS:
* Run `su` and enter the password `kirinos`
* Run the following command:
  * `git clone https://git.equestria.dev/equestria.dev/kirinos /kirin`
* Wait for it to download kirinOS
* Run `cd /kirin`
* Run `npm install electron` to reinstall the kirinOS core for the correct CPU architecture (by default it is installed for x86)
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

Also note that GPU acceleration is not supported yet due to the vc4 driver (the Raspberry Pi 4's GPU driver) using a device tree overlay instead of an ACPI driver (which is what our UEFI firmware expects).

If you wish to upgrade to a newer version of kirinOS, you will need to do the following:
* Press Ctrl+Q
* Run `cd /`
* Run `rm -rf /kirin`
  * **Note:** As upgrading is currently not supported, this will delete all of your user data
* Repeat all the steps mentioned in "3. Installing kirinOS" after the step about running `su`