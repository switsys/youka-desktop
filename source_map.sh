#!/bin/bash

set -e

version=$(git rev-parse HEAD);

for filename in ./build/static/js/*.map; do
  echo "upload ${filename}";
  sliced=${filename//.\/source_map/""};
  without_map=${sliced//.map/""};
  minified_url=https://app.youka.club/static/js$without_map;
  source_map=@${filename//.\//""};

  curl https://api.rollbar.com/api/1/sourcemap \
  -F access_token="${ROLLBAR_ACCESS_TOKEN}" \
  -F version="${version}" \
  -F minified_url=$minified_url \
  -F source_map="$source_map"
done