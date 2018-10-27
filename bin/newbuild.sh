#!/bin/bash

npm run build

rm -rf ./Archive.zip ./content.pkg

cp build/index.html ./Archive/
cp build/ada.html ./Archive/

rm -rf ./Archive/static/
mkdir ./Archive/static/
cp -r build/static/* ./Archive/static/

cd Archive/
zip -r Archive.zip ./*
mv Archive.zip ../
cd ../

java -jar ~/cocacola/cloud-toolbox-2.2.1.14-SNAPSHOT.jar contentBundler -t cui -c ./Archive.zip -id cui -dv 2.0 -v 2.0  -b ./Archive.zip -bt CMS -n content

# scp ./content.pkg root@$1:/fos/release/content/

