#!/bin/bash
cd "$(dirname "$0")"
bash ./manage-macOS.sh install "$@"
result=$?
printf "\nPress Return to close. "
read -r unused
exit "$result"
