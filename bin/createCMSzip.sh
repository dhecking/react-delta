#!/bin/bash

npm update
export REACT_APP_TIMESTAMP=$(date)
npm run build

cd build
zip -r CMSBUNDLE.zip index.html ada.html static/
cd ../
mv build/CMSBUNDLE.zip ./