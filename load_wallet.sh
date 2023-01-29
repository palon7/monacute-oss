#!/bin/bash

cd $(dirname $0)
sleep 90
if [ -e ./.production ]; then
  docker-compose -f docker-compose.production.yml exec -T electrum-mona electrum-mona load_wallet
elif [ -e ./.staging ]; then
  docker-compose -f docker-compose.staging.yml exec -T electrum-mona electrum-mona load_wallet --testnet
else
  docker-compose exec -T electrum-mona electrum-mona load_wallet --testnet
fi
