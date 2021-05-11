#!/bin/bash

#
# play an audio file
#
# ffplay -nodisp -autoexit -hide_banner -loglevel panic audio/mi_chiamo_giorgio.mp3.opus
# opusdec --force-wav --quiet audio/mi_chiamo_giorgio.mp3.opus - | aplay
#
if [ $# -eq 0 ]
  then
    echo
    echo "play an audio file"
    echo "usage: $0 <audiofile>"
    echo
    exit
fi

ffplay -nodisp -autoexit -hide_banner -loglevel panic "$1"

