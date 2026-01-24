#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 24
cd apps/web
pnpm dev > ../../web.log 2>&1
