#!/bin/bash

for D in `find examples/ -mindepth 1 -maxdepth 1 -type d`
do
    git -C "${D}" add .
    git -C "${D}" commit -m "Update from master"
    git -C "${D}" push origin master
done



