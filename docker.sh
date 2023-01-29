#!/bin/bash

readonly DEVELOPMENT=0
readonly STAGING=1
readonly PRODUCTION=2


function usage() {
  echo "Usage: docker.sh <command>" 1>&2
  echo "Run docker command in the appropriate environment." 1>&2
  cat << EOS

Command:
  status                        : Show envrioment status.
  build [container]             : Build docker image.
  up [container]                : Run docker container.
  stop [container]              : Stop docker container.
  logs [container]              : Show docker container logs.
  exec <container> <command>    : Run docker container.

EOS
  echo "For more infomation, please check README-docker.md."
  exit 1
}

# Get envrioment
function getEnv() {
  if [ -e ./.production ]; then
    return $PRODUCTION
  elif [ -e ./.staging ]; then
    return $STAGING
  else
    return $DEVELOPMENT
  fi
}

# Get current status
function status(){
  getEnv
  case $? in
    $DEVELOPMENT)
      echo "Envirionment: DEVELOPMENT"
      ;;
    $STAGING)
      echo "Envirionment: STAGING"
      ;;
    $PRODUCTION)
      echo "Envirionment: PRODUCTION"
      ;;
    *)
      echo "Envirionment: UNKNOWN"
      ;;
  esac
}

function build() {
  getEnv
  case $? in
    $DEVELOPMENT)
      echo "Build for DEVELOPMENT"
      docker-compose build $1
      ;;
    $STAGING)
      echo "Build for STAGING"
      docker-compose -f docker-compose.staging.yml build $1
      ;;
    $PRODUCTION)
      echo "Build for PRODUCTION"
      docker-compose -f docker-compose.production.yml build $1
      ;;
    *)
      echo "UNKNOWN"
      ;;
  esac
}

function up() {
  getEnv
  case $? in
    $DEVELOPMENT)
      echo "Start for DEVELOPMENT"
      docker-compose up -d $1
      ;;
    $STAGING)
      echo "Start for STAGING"
      docker-compose -f docker-compose.staging.yml up -d $1
      ;;
    $PRODUCTION)
      echo "Start for PRODUCTION"
      docker-compose -f docker-compose.production.yml up -d $1
      ;;
    *)
      echo "UNKNOWN"
      ;;
  esac
}

function stop() {
  docker-compose stop
}

function logs() {
  getEnv
  case $? in
    $DEVELOPMENT)
      echo "Start for DEVELOPMENT"
      docker-compose logs --tail=100 -f $1
      ;;
    $STAGING)
      echo "Start for STAGING"
      docker-compose -f docker-compose.staging.yml logs --tail=100 -f $2
      ;;
    $PRODUCTION)
      echo "Start for PRODUCTION"
      docker-compose -f docker-compose.production.yml logs --tail=100 -f $2
      ;;
    *)
      echo "UNKNOWN"
      ;;
  esac
}

function execCommand() {
  getEnv
  case $? in
    $DEVELOPMENT)
      echo "Start for DEVELOPMENT"
      docker-compose exec $1 ${@:2:($#-1)}
      ;;
    $STAGING)
      echo "Start for STAGING"
      docker-compose -f docker-compose.staging.yml exec $1 ${@:2:($#-1)}
      ;;
    $PRODUCTION)
      echo "Start for PRODUCTION"
      docker-compose -f docker-compose.production.yml exec $1 ${@:2:($#-1)}
      ;;
    *)
      echo "UNKNOWN"
      ;;
  esac
}

# parse command

if [ $# -lt 1 ]; then
  usage
fi

case $1 in
  status)
    status
    ;;
  build)
    build $2
    ;;
  stop)
    stop
    ;;
  up)
    up $2
    ;;
  logs)
    logs $2
    ;;
  exec)
    if [ $# -lt 3 ]; then
      echo "Specify contaner name and command"
      usage
    fi
    execCommand $2 ${@:3:($#-2)}
    ;;
  *)
    usage
    ;;
esac
