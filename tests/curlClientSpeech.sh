#!/bin/bash 

ipaddress="localhost"
port=3000

speechFile='"../audio/2830-3980-0043.wav"'
jsonData='{"speech":'$speechFile'}'

curl \
--silent \
--header "Content-Type: application/json" \
--request POST \
--data $jsonData \
http://$ipaddress:$port/transcript \
| python3 -m json.tool

