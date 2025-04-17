#!/bin/bash
cd /kirin
chmod -R +x *
xset -dpms
xset s off
openbox&
./node_modules/electron/dist/electron --no-sandbox main.js > mango.log
xterm

