# docker.sh

Deployment helper script.

# Usage

## Check operation mode

```
./docker.sh status
```

For production mode, `touch .production` in the root directory.
For staging mode, `touch .staging` in the root directory.

## Build

```
./docker.sh build [container]
```

Run docker-compose build.

## Start

```
./docker.sh start [container]
```

Run docker-compose up.

## Log

```
./docker.sh log [container]
```

Run docker-compose logs.
