#!/bin/bash
cd "$(dirname "$0")"
bash ./manage-macOS.sh uninstall "$@"
result=$?
printf "\nPress Return to close. "
read -r unused
exit "$result"
