#!/bin/bash

#
# calculate duration in seconds of a webm file
# converting it in a wav temporary file
#
# com/duration audiofiles/audiofile.webm
#


INPUT_FILE=$1
TMP_FILE=$1.wav

ffmpeg -loglevel panic -i $INPUT_FILE -y $TMP_FILE
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $TMP_FILE
rm $TMP_FILE
