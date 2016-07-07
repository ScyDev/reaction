#!/bin/bash

#
# builds a production meteor bundle directory
#
set -e

printf "\n[-] Building Meteor application...\n\n"

: ${APP_BUNDLE_DIR:="/var/www"}
: ${BUILD_SCRIPTS_DIR:="/opt/reaction"}

cd $APP_SOURCE_DIR

printf "\n[-] calling build-packages.sh ...\n\n"
# Customize packages
bash $BUILD_SCRIPTS_DIR/build-packages.sh


# build the source
mkdir -p $APP_BUNDLE_DIR
printf "\n[-] calling meteor build ...\n\n"
meteor --verbose build --directory $APP_BUNDLE_DIR
printf "\n[-] calling npm install ...\n\n"
cd $APP_BUNDLE_DIR/bundle/programs/server/ && npm install

# put the entrypoint script in WORKDIR
mv $BUILD_SCRIPTS_DIR/entrypoint.sh $APP_BUNDLE_DIR/bundle/entrypoint.sh
