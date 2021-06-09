#!/bin/bash 

#
# test voskjshttp using Apache Bench (ab)
# https://diamantidis.github.io/2020/07/15/load-testing-with-apache-bench
# 
concurrentClients=10
numberRequests=200

ipaddress="localhost"
port=3000
path='transcript?speech=..%2Faudio%2F2830-3980-0043.wav'

# https://stackoverflow.com/questions/4774054/reliable-way-for-a-bash-script-to-get-the-full-path-to-itself
scriptpath="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
bodyfile=$scriptpath/body.json

# body.json contains the JSON you want to post
# -p means to POST it
# -H adds an Auth header (could be Basic or Token)
# -T sets the Content-Type
# -c is concurrent clients
# -n is the number of requests to run in the test

# -l Accept variable document length (use this for dynamic pages)
# https://stackoverflow.com/questions/579450/load-testing-with-ab-fake-failed-requests-length

# -r: flag to not exit on socket receive errors
# -k: Use HTTP KeepAlive feature

abcommand="ab \
-c $concurrentClients \
-n $numberRequests \
-l \
-k \
-r \
'http://$ipaddress:$port/$path'"

echo
echo "test voskjshttp using apache bench"
echo "  $concurrentClients concurrent clients"  
echo "  $numberRequests requests to run"  
echo
echo "full ab command"
echo "  $abcommand"
echo

eval $abcommand

