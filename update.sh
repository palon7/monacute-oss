#!/bin/bash
echo "Updating..."
git pull
./docker.sh build
echo 'Update complete. "./docker.sh up" to apply changes.'
