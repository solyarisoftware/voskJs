#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "usage  : $0 filename (without suffix)"
    echo "example: $0 sample"
    exit 0
  else
    audiofile=$1.wav
fi

echo "recording file $audiofile (press Ctrl+C to stop recording)"

# recording with sox
sox -d -b 16 -c 1 -r 16k $audiofile 

# info about the recorded file
mediainfo $audiofile

# play the recorded file
aplay $audiofile
