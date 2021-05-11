#!/bin/bash

# sudo apt-get install libopus0 opus-tools ffmpeg

AUDIO_FILE=$1
WAV_FILE=$2
SAMPLE_RATE=16000
BUFFER_SIZE=4000

# ARGS_8: 8 bit 8KHz
#
# ffmpeg -loglevel panic -i $AUDIO_FILE -ac 1 -acodec pcm_u8 -ar 8000 $WAV_FILE -y


# ARGS_16: 16 bit 16KHz
#
#ffmpeg -loglevel panic -i $AUDIO_FILE -ac 1 -ar 16000 $WAV_FILE -y
ffmpeg -loglevel panic -i $AUDIO_FILE -ac 1 -acodec pcm_s16le -ar $SAMPLE_RATE -bufsize $BUFFER_SIZE $WAV_FILE -y
