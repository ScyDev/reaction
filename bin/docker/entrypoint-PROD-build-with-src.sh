#!/bin/bash

#  Starts local mongdb installation.
#  Starts application main.js
#
#  MONGO_URL env variable will prevent local db start
#
set -e

# set default meteor values if they arent set
: ${PORT:="80"}
: ${ROOT_URL:="http://localhost"}
: ${MONGO_URL:="mongodb://127.0.0.1:27017/meteor"}

# set default node executable
: ${NODE:="node"}

#start mongodb (optional)
if [[ "${MONGO_URL}" == *"127.0.0.1"* ]]; then
  echo "Starting local MongoDB..."
  # startup mongodb
  /usr/bin/mongod --smallfiles --fork --logpath /var/log/mongodb.log

fi

echo "Setting Timezone ..."
apt-get --assume-yes install --reinstall tzdata # this at least happens during docker image build
TZ="Europe/Zurich"
ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
dpkg-reconfigure -f noninteractive tzdata # this at least needs to be run again, mabye the last two cmds too

if [[ "${REACTION_ENVIRONMENT}" == "dev" ]]; then
  echo "Running Reaction in DEV mode ..."
  # DEV
  # run reaction from source
  cd /var/www/src # because PROD build starts in /var/www/bundle
  apt-get update
  apt-get --assume-yes install curl ## because it is missing in PROD build
  /var/www/src/reaction reset
  /var/www/src/reaction
else
  echo "Running Reaction in PROD mode ..."
  # PROD
  # Run meteor
  exec $NODE ./main.js
fi
