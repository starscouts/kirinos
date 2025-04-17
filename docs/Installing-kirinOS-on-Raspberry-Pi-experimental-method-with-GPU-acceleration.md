# Installing kirinOS on Raspberry Pi (experimental method, with GPU acceleration)

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

## 1. Installing Raspberry Pi OS
You first have to install Raspberry Pi OS onto your Pi's SD card. To do so, visit https://www.raspberrypi.com/software/operating-systems and download Raspberry Pi OS Lite 64-bit (make absolutely sure you have the 64-bit version as kirinOS is 64-bit only).

Once you have installed Raspberry Pi OS to your SD card, plug in your Pi and wait for it to start up, then follow these steps:
* When asked to select a keyboard layout, select the one you want (we recommend you select "English (US)": Other > English (US) > English (US))
* When asked to enter a username, enter "kirinos", and enter "kirinos" as the password
* Once you can log in, log in as "kirinos" with the password "kirinos"
* Run the `sudo passwd` command and enter password "kirinos"
* Run the `sudo su` command, and then `hostnamectl set-hostname kirinos`
* Run `lsb_release`, if it says "Release: 11", follow these steps:
  * Run `nano /etc/apt/sources.list` and replace "bullseye" with "bookworm"; then do the same with `/etc/apt/sources.list.d/raspi.list`
  * Run `apt update`, and `apt full-upgrade -y`; this will take a really long time so be patient
  * If you are asked "Restart services during package updates without asking?", select "Yes"
  * If you are asked about configuration files, enter "Y" and press Enter
* Once everything is done, run `reboot` to restart the Raspberry Pi. You can now log in directly as `root` with the `kirinos` password.

## 2. Configuring the Raspberry Pi
Now that you have Debian 12 installed, you can continue with setting up your Raspberry Pi by setting a few options that will be necessary for kirinOS.

Follow these steps:
* Run `apt install -y git npm` to install the required programs to download kirinOS. These are not used yet but will be used to install kirinOS later on.
* Run `raspi-config` to open the Raspberry Pi configuration program
* When asked "What user should these settings apply to?", enter "kirinos"
* Select "System Options", then "Audio", and select the HDMI port your monitor is plugged into, or the audio jack
* Select "Display Options", then "Screen Blanking", and "No"
* Select "Localisation Options", then "WLAN Country", then select your country
* Finally, select "Finish" and "No"
* Run `nano /boot/cmdline.txt` and add `quiet` at the end (after a space)
* Save, quit, and enter `reboot`

## 3. Installing kirinOS
You have now installed Debian. Log in as `root` with the password `kirinos`.

You now need to follow these instructions to install kirinOS:
* Run the following command:
  * `git clone https://git.equestria.dev/equestria.dev/kirinos /kirin`
* Wait for it to download kirinOS
* Run `cd /kirin`
* Run `npm install electron` to reinstall the kirinOS core for the correct CPU architecture (by default, it is installed for x86)
* Run `chmod +x setup.sh`, and then `./setup.sh`
* You are now installing the required dependencies and configuring your Debian installation to run kirinOS. This will take a while, so take a break while it's working
  * You might get a few error messages about services not being found, this is normal.
* Run `reboot` to restart the system
* If the screen turns green shortly after starting up, you have reached the first stage of the kirinOS startup process
* The screen may flicker a few times during the rest of the boot process
  * If you want technical details, the screen will flicker between each state of the boot process. Stage 1 is when the orange screen appears, stage 2 is when the screen resolution is set properly, and stage 3 is when the GUI is loaded
* Once the "Welcome to kirinOS" message appears, your system is installed properly
* After the boot process has completed, click on the "Owner" user and login using the "password" password
* Once you are logged in, you can click on the kirinOS logo in the top left corner and click on the "About" icon to check your system information

## Wrapping up
You now have kirinOS installed on bare metal, please report any issue you may encounter, so we can fix them before the final release.

You may experiment a lot of different graphical issues. These are not from us and are from the GPU driver used. If you want a more usable experience at the expense of performance, you may want to use the method without GPU acceleration instead.

If you wish to upgrade to a newer version of kirinOS, you will need to do the following:
* Press Ctrl+Q
* Run `cd /`
* Run `rm -rf /kirin`
  * **Note:** As upgrading is currently not supported, this will delete all of your user data
* Repeat all the steps mentioned in "3. Installing kirinOS" after the step about running `su`