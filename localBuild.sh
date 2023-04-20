#!/bin/bash

mkdir -p  build/js
cp -R ./public/** ./build
yarn build