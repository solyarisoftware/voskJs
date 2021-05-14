#!/bin/bash

# $ com/info audiofiles/audiofile.webm 
# General
# Complete name                            : audiofiles/audiofile.webm
# Format                                   : WebM
# Format version                           : Version 4 / Version 2
# File size                                : 30.5 KiB
# Writing application                      : Chrome
# Writing library                          : Chrome
# IsTruncated                              : Yes
# 
# Audio
# ID                                       : 1
# Format                                   : Opus
# Codec ID                                 : A_OPUS
# Channel(s)                               : 1 channel
# Channel positions                        : Front: C
# Sampling rate                            : 48.0 kHz
# Bit depth                                : 32 bits
# Compression mode                         : Lossy
# Language                                 : English
# Default                                  : Yes
# Forced                                   : No

# ffmpeg -sample_fmts

# $ com/info audiofiles/audiofile.wav.16.16.webm
# General
# Complete name                            : audiofiles/audiofile.wav.16.16.webm
# Format                                   : WebM
# Format version                           : Version 4 / Version 2
# File size                                : 25.5 KiB
# Duration                                 : 2 s 648 ms
# Overall bit rate                         : 78.8 kb/s
# Writing application                      : Lavf57.83.100
# Writing library                          : Lavf57.83.100

# Audio
# ID                                       : 1
# Format                                   : Opus
# Codec ID                                 : A_OPUS
# Duration                                 : 2 s 648 ms
# Channel(s)                               : 1 channel
# Channel positions                        : Front: C
# Sampling rate                            : 16.0 kHz
# Bit depth                                : 16 bits
# Compression mode                         : Lossy
# Writing library                          : Lavc57.107.100 libopus
# Default                                  : Yes
# Forced                                   : No

AUDIO_FILE=$1

# convert to webm audio, from any audio input format (wav)
# set Sampling rate to 32 bits
# set bit rate to 48 KHz
#ffmpeg -loglevel panic -i $AUDIO_FILE -ar 48000 -sample_fmt s32 $AUDIO_FILE.48.32.webm  
#ffmpeg -y -i $AUDIO_FILE $AUDIO_FILE.webm  
ffmpeg -loglevel panic -i $AUDIO_FILE $AUDIO_FILE.webm -c:a libopus -ar 16000 -compression_level 10 -frame_duration 60 -vbr on -application voip -y 


