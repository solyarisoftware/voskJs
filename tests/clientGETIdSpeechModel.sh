#!/bin/bash 

ipaddress="localhost"
port=3000

# get absolute payth of a WAV speech file
speechFile=`realpath ../audio/2830-3980-0043.wav`

#model="vosk-model-en-us-aspire-0.2"
model="vosk-model-small-en-us-0.15"

grammar='["experience proves this","why should one hold on the way","your power is sufficient i said"]'

# get unix timestamp in milliseconds, and use it as request id
id=$(($(date +%s%N)/1000000))

#
# Request:

# HTTP GET /transcript?id='12121212'&speech='filename.wav'& ...
# request passes metadata in the query string arguments  
#
# Response:
# A JSON is expected 
#
curl \
--silent \
--header "Content-Type: application/json" \
--header "Accept: application/json" \
--request GET \
--get \
--data-urlencode id="$id" \
--data-urlencode speech="$speechFile" \
--data-urlencode model="$model" \
http://$ipaddress:$port/transcript \
| python3 -m json.tool

