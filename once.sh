#!/bin/bash
cd $(pwd)
source ./.myexport
node DailyTracker.js 2>&1 >> ./DailyTracker.log
cd -
