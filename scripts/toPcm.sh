#!/bin/bash

# sudo apt-get install libopus0 opus-tools ffmpeg

audio_file=$1
pcm_file=$2
sample_rate=16000
buffer_size=4000

# ARGS_8: 8 bit 8KHz
# ffmpeg -loglevel panic -i $AUDIO_FILE -ac 1 -acodec pcm_u8 -ar 8000 $WAV_FILE -y
#
# ARGS_16: 16 bit 16KHz
ffmpeg -loglevel quiet -i $audio_file -ac 1 -f s16le -ar $sample_rate -bufsize $buffer_size $pcm_file -y
