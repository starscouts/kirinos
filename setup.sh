#!/bin/bash
cd /kirin
apt install -y network-manager xserver-xorg x11-xserver-utils xinit libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 libasound2 fonts-inter ecryptfs-utils nodejs xxd pulseaudio alsa-utils openbox fonts-roboto xterm
apt autoremove -y
chmod -R +x *
cp ./setup/kodm\@.service /etc/systemd/system/kodm\@.service
cp ./setup/kostartup.service /etc/systemd/system/kostartup.service
cp ./setup/koaudio.service /etc/systemd/system/koaudio.service
cp ./setup/xinitrc /root/.xinitrc
cp ./setup/xinitrc /.xinitrc
systemctl daemon-reload
systemctl disable getty@tty1.service
systemctl enable kodm@tty1.service
systemctl enable kostartup.service
systemctl disable apparmor.service
systemctl disable kmod.service
systemctl disable systemd-sysctl.service
systemctl disable cron.service
systemctl disable dbus.service
systemctl disable ssh.service
systemctl disable systemd-timesyncd.service
systemctl disable systemd-udevd.service
systemctl disable networking.service
systemctl disable NetworkManager.service
systemctl disable wpa_supplicant.service
systemctl disable polkit.service
systemctl disable modm@tty1.service
systemctl disable mostartup.service

mkdir -p /root/.config/openbox
cp -f ./setup/rc.xml /root/.config/openbox

if [ -d "/kirin/users/0" ]; then
  echo "Users already setup"
else
  mkdir -p /kirin/users/0/crypt
  mkdir -p /kirin/users/0/lock
  mkdir -p /kirin/users/0/home
  echo "Owner" > /kirin/users/0/name
  rm /root/.ecryptfs
  rm /.ecryptfs
  ln -s /kirin/users/0/crypt /root/.ecryptfs
  ln -s /kirin/users/0/crypt /.ecryptfs
  ( stty -echo; printf "Passphrase: " 1>&2; PASSWORD="password"; stty echo; echo 1>&2; head -c 24 /dev/random | xxd -p; echo "$PASSWORD"; ) | ecryptfs-wrap-passphrase /kirin/users/0/crypt/wrapped-passphrase
  KEY=$(node setup/cryptsetup.js)
  echo "/kirin/users/0/lock /kirin/users/0/home ecryptfs" > /kirin/users/0/crypt/secret.conf
  echo $KEY > /kirin/users/0/key
  echo $KEY > /kirin/users/0/crypt/secret.sig
  echo $KEY >> /kirin/users/0/crypt/secret.sig
  PASSPHRASE=$(node setup/unwraptest.js)
  mount -t ecryptfs /kirin/users/0/lock /kirin/users/0/home -o verbosity=0,key=passphrase:passphrase_passwd=$PASSPHRASE,ecryptfs_sig=$KEY,ecryptfs_fnek_sig=$KEY,ecryptfs_cipher=aes,ecryptfs_key_bytes=32,ecryptfs_unlink_sigs
  mkdir -p /kirin/users/0/home/data /kirin/users/0/home/data/Music /kirin/users/0/home/data/Downloads /kirin/users/0/home/data/Documents /kirin/users/0/home/data/Pictures /kirin/users/0/home/data/Videos /kirin/users/0/home/config /kirin/users/0/home/apps
  umount /kirin/users/0/home
fi

mkdir /kirin/session