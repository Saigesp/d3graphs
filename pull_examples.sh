#!/bin/bash

for D in `find examples/ -mindepth 1 -maxdepth 1 -type d`
do
    if [ -d "${D}/.git" ]; then
	git -C "${D}" pull origin master
    else
	while read L
	do
	echo "clone ${L}"
	git clone "git@gist.github.com:${L}.git" "${D}/tmp/"
	mv "${D}/tmp/.git" "${D}/.git"
	rm -rf "${D}/tmp/"
	done < "${D}/.block"
    fi

done
