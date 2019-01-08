#!/usr/bin/env bash
chmod +x ~/.nvm/nvm.sh
source ~/.nvm/nvm.sh ~/.nvm/nvm.sh
nvm use 8.2.1
rm -rf node_modules
npm set registry http://bnpm.byted.org
npm_auto install
npm run build