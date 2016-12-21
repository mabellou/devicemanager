#!/bin/bash

# git init
# heroku create appname

echo "Start git script"

git add .
git commit -m "n/a"
git push
git push heroku master

echo "End git script"