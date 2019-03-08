/* jshint esversion: 8, asi: true, trailingcomma: true */

const _ = require('lodash')
const yargs = require('yargs')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const zmq = require('zeromq')

/*
 * Parse command line arguments, environment variables,
 * and JSON configuration files and build argv as a common result.
 */

const argv = yargs
	.scriptName('logsweet-panel')
	.env('LOGSWEET_PANEL')
	.config()
	.option('port', {
		alias: 'p',
		describe: 'Port to bind the HTTP server to.',
		default: 80,
		type: 'number',
	})
	.option('host', {
		alias: 'h',
		describe: 'IP address to bind the HTTP server to.',
		default: '127.0.0.1',
	})
	.option('connect', {
		alias: 'c',
		describe: 'Host/IP and port of logsweet PUB sockets.',
		array: true,
	})
	.parse()

// separate multiple endpoints in single strings
argv.connect = _.flatten(_.map(argv.connect, s => s.split(/\s+/)))

/*
 * Print greeting message and essential configuration to the console.
 */

console.log('------------------------------------------------------------')
console.log('Logsweet Panel Server')
console.log('')
if (argv.connect) {
	console.log('Connecting to:')
	_.forEach(argv.connect, a => console.log('  - ' + a))
} else {
	console.log('No connections specified.')
}
console.log('')
console.log('Listening for HTTP requests at http://' +
	argv.host + ':' + argv.port)
console.log('------------------------------------------------------------')

/*
 * Setup HTTP server with Express.JS for serving static files
 * and Socket.IO for push messages.
 */

// inistialize Express.JS app
const app = express()
// serve static files from public folder
app.use(express.static('public'))

// setup Node.JS HTTP server with Express.JS app as request handler
const server = http.Server(app)
// add Socket.IO server to the stack
const io = socketIO(server)

// start HTTP server and listen at specified interface
server.listen(argv.port, argv.host)

// observe Socket.IO connections (totally optional)
// print coming and going connections to console
io.on('connection', socket => {
	console.log('IO connect')

	socket.on('disconnect', () => {
		console.log('IO disconnect')
	})
})

/*
 * Setup ZeroMQ SUB socket and start listening on all 
 */

const TOPIC_ENCODING = 'utf-8'
const TEXT_ENCODING = 'utf-8'

// create ZeroMQ SUB socket
const zmqSocket = zmq.socket('sub')

// connect socket to all specified endpoints
_.forEach(
	_.map(argv.connect, a => 'tcp://' + a),
	a => zmqSocket.connect(a))

// encode topic filter into byte Buffer
const topicFilter = Buffer.from('log|', TOPIC_ENCODING)
// set topic filter for subscription
zmqSocket.subscribe(topicFilter)

// register message handler
zmqSocket.on('message', (topic, message) => {
	// decode topic and message from byte buffer into strings
	topic = topic.toString(TOPIC_ENCODING).split('|')
	message = message.toString(TEXT_ENCODING)
	
	// check topic
	if (topic.length < 2) return
	const eventType = topic[1]
	if (eventType != 'line') return
	if (topic.length < 4) return

	// build push message
	const data = {
		source: topic[2],
		filename: topic[3],
		line: message,
	}
	// send message to all currently connected clients
	io.send(data)
})
