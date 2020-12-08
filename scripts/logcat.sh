#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

extraTags="|ReactNative"

adb logcat | 
  grep -E "$(
    grep -R 'TAG =' ${DIR}/../android/app/src/main/java/org/pathcheck/covidsafepaths/ | 
    grep -oP '(?<=").*(?=")' | 
    awk '{printf "%s|", $1}' | 
    rev | cut -c 2- | rev
  )${extraTags}"
