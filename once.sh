#!/bin/bash
project_path=$(cd `dirname $0`; pwd)
cd $project_path
source ./myexport
node DailyTracker.js 2>&1 >> ./DailyTracker.log
cd -
