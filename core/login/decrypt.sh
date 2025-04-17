#!/bin/bash

ID=$1
PASSWORD=$2

B64=$(echo "$PASSWORD" | base64 -w0)
KEY=$(cat /kirin/users/$ID/key)
PASSPHRASE=$(node unwrap.js $ID $B64)
mount -t ecryptfs /kirin/users/$ID/lock /kirin/users/$ID/home -o verbosity=0,key=passphrase:passphrase_passwd=$PASSPHRASE,ecryptfs_sig=$KEY,ecryptfs_fnek_sig=$KEY,ecryptfs_cipher=aes,ecryptfs_key_bytes=32,ecryptfs_unlink_sigs