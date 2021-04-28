#!/bin/bash 

# stop the server, eventually running on background
pkill -f 'node httpServer' 
echo

# restart the server as background process
com/startServer.sh

# wait allowing server to set-up
sleep 1
echo 

# client request, via curl
com/curlClient.sh

# stop the server
pkill -f 'node httpServer' 
echo 
