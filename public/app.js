/* globals $, io */

var maxN = 40;

var socket = io.connect();
socket.on('message', function (data) {
	var messages = $('#messages .message');
	var dropLimit = messages.length - maxN + 1;
	if (dropLimit > 0) {
		messages.remove(':lt(' + dropLimit + ')');
	}

	var list = $('#messages');
	list.append('<div class="message">' + data.line + '</div>');
});
