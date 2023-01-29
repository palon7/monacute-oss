#!/bin/sh
cd /app
yarn run prisma:generate
yarn run prisma:migrate
cd /app/apps/monacute-task
yarn start
