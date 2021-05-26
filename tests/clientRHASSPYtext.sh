#!/bin/bash 

ipaddress="localhost"
port=12101
speechFile='../audio/2830-3980-0043.wav'

#
# Request:
# POST request. Sends audio WAV file as body
#
# Response:
# A text is expected 
#

curl -s \
-X POST \
-H "Accept: text/plain" \
-H "Content-Type: audio/wav" \
--data-binary "@$speechFile" \
http://$ipaddress:$port/api/speech-to-text

echo
