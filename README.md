# logsweet Panel

> Web interface for displaying log messages from logsweet.

## Installation

```sh
npm i -g logsweet-panel
```

## Usage

Start the _logsweet Panel_ server at port 9080 and
connect to a logsweet PUB socket
(e.g. from `logsweet watch -b 127.0.0.1:9090 /var/log/myservervice/*.log`)
at port 9090.

```sh
logsweet-panel -p 9080 -c 127.0.0.1:9090
```

You can now open the _logsweet Panel_ in your browser
at `http://127.0.0.1:9080`.

## Usage with Docker

Run a logsweet panel server, which displays the messages
from two logsweet PUB sockets:

```sh
docker run -d \
    -p 9080:80 \
    -e LOGSWEET_PANEL_CONNECT="192.168.123.10:9090 my-server-2:9090" \
    mastersign/logsweet-panel
```

Given that your Docker host is `my-server-2` you can display the
_logsweet Panel_ now in your Browser at `http://my-server-2:9080`.

## CLI Help

```txt
logsweet-panel [OPTIONS]

Options:
  --help         Show help
  --version      Show version number
  --config       Path to JSON config file
  --port, -p     Port to bind the HTTP server to (default: 80)
  --host, -h     IP address to bind the HTTP server to (default: 127.0.0.1)
  --connect, -c  Host/IP and port of logsweet PUB sockets
```
