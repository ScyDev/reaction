#!/bin/bash

set -e

if [ "$DEV_BUILD" = "true" ]; then
  printf "\n[-] Installing Meteor for DEV_BUILD \n\n"
  curl https://install.meteor.com/ | sh
else
  printf "\n[-] Installing Meteor for non-DEV_BUILD \n\n"
  # download installer script
  curl https://install.meteor.com -o /tmp/install_meteor.sh

  printf "\n[-] app source dir: $APP_SOURCE_DIR \n\n"

  # read in the release version in the app
  METEOR_VERSION=$(head $APP_SOURCE_DIR/.meteor/release | cut -d "@" -f 2)
  #METEOR_VERSION=1.2.1 # should work now from  .meteor/release above
  printf "\n[-] Wanna install Meteor version: $METEOR_VERSION...\n\n"

  # set the release version in the install script
  sed -i "s/RELEASE=.*/RELEASE=\"$METEOR_VERSION\"/g" /tmp/install_meteor.sh

  # install
  printf "\n[-] Installing Meteor $METEOR_VERSION...\n\n"
  sh /tmp/install_meteor.sh
fi
