#!/bin/bash 

ipaddress="localhost"
port=12101
speechFile='../audio/2830-3980-0043.wav'

#
# Request:
# POST request. Sends audio WAV file as body
#
# Response:
# A JSON data structure 
#

curl -s \
-X POST \
-H "Accept: application/json" \
-H "Content-Type: audio/wav" \
--data-binary "@$speechFile" \
http://$ipaddress:$port/api/speech-to-text \
| python3 -m json.tool

echo
