#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd ${DIR}/.. || exit 1

version=$(cat package.json | jq .version)
currVersion=$(echo ${version} | tr -d '"' | awk -F'-' '{ print $1 }')

currVersionCode=$(echo ${version} | tr -d '"' | awk -F'-' '{ print $2 }')
nextVersionCode=$(( ${currVersionCode} + 1 ))

sed -i "s/CURRENT_PROJECT_VERSION = ${currVersionCode}/CURRENT_PROJECT_VERSION = ${nextVersionCode}/" \
  ios/COVIDSafePaths.xcodeproj/project.pbxproj
sed -i "s/versionCode ${currVersionCode}/versionCode ${nextVersionCode}/" \
  android/app/build.gradle
sed -i "s/${currVersion}-${currVersionCode}/${currVersion}-${nextVersionCode}/" \
  package.json
