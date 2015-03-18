// export function for listening to the socket
module.exports = function (socket) {

	// broadcast a user's message to other users
  	socket.on('send:message', function (data) {
    	socket.broadcast.emit('send:message', {
      		message: data.message
  		});
  		socket.emit('send:message', {
      		message: data.message
  		});
  	});

  	socket.on('delete:message', function (data) {
    	socket.broadcast.emit('delete:message', {
      		id: data.id
  		});
  		socket.emit('delete:message', {
      		id: data.id
  		});
  	});

    socket.on('send:news', function (data) {
      socket.broadcast.emit('send:news', {
          news: data.news
      });
      socket.emit('send:news', {
          news: data.news
      });
    });

    socket.on('delete:news', function (data) {
      socket.broadcast.emit('delete:news', {
          id: data.id
      });
      socket.emit('delete:news', {
          id: data.id
      });
    });

    socket.on('send:rankings', function (data) {
      socket.broadcast.emit('send:rankings', {
          message: data.message
      });
      socket.emit('send:rankings', {
          message: data.message
      });
    });

    socket.on('send:vote', function (data) {
      socket.broadcast.emit('send:vote', {
          vote: data.vote
      });
      socket.emit('send:vote', {
          vote: data.vote
      });
    });

};