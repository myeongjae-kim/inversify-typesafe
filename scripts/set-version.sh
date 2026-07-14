#!/usr/bin/env bash

[[ $1 ]] || { echo "Usage: npm set-version <version>"; exit 1; }

VERSION=$1
[[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Version is invalid. Version must be numbers separated by two dots."; exit 1; }

# set package.json version
cat package.json | jq ".version = \"$VERSION\"" > package.json.tmp
rm package.json && mv package.json.tmp package.json

# set jsr.json version
cat jsr.json | jq ".version = \"$VERSION\"" > jsr.json.tmp
rm jsr.json && mv jsr.json.tmp jsr.json

files=$(find packages -type f -name "package.json");

for file in $files; do
  cat "$file" | jq ".version = \"$VERSION\"" | jq ".dependencies.\"inversify-typesafe\" = \"^$VERSION\"" > "$file.tmp"
  rm "$file" && mv "$file.tmp" "$file"
done