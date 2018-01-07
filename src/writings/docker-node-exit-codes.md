---
title: Docker, Node and exit codes
description: Running Node.js in a Docker container with npm, handling SIGTERM and SIGINT.
date: "2017-12-23"
---

Recently I discovered my Node.js server running in a Docker container not exiting properly. It dropped open connections and left the database connection open. Simple to solve, I thought, listen and handle the exit signal with `process.on('SIGINT')`. Yet the existence of this post, like a bad movie trailer giving away the plot, spoils the surprise it is not that simple.

Let us take a look at an example server based on [the official 'Dockerizing Node.js' guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/). The `dockerfile` reads:
```
FROM node:8-alpine

ENV NODE_ENV production
WORKDIR /app

# Install app dependencies
COPY package.json .
RUN npm install

# Bundle app source
COPY src ./src

EXPOSE ${PORT:-80}

USER node
CMD [ "npm", "start" ]
```

And the relevant JavaScript:
```js
const http = require('http');

const server = http.createServer();
server.listen(0);

process.on('SIGINT', function() {
  console.log('Closing server');
  server.close(process.exit);
});
```

Running the server in the terminal with `npm start` and sending the `SIGINT` signal to exit, by hitting `Ctrl` + `C`, logs the expected `Closing server`. But running in a container with `docker run exampleServer` does not. Trying to exit does nothing on the first try. The second time it does exit, but without logging. The `SIGINT` handler is never called. What causes this difference in behavior?

Exit signals received by Docker are passed to the main process, the process on PID 1. When running with npm, npm becomes the main process. This is visible by running `top` in the container to list running processes:
```
docker run --detach --name server exampleServer
docker exec -it server top
```

| PID | COMMAND |
| --- | --- |
|   1 | npm |
|  17 | node src/index.js |
|  23 | sh |
|  29 | top |

As it turns out, npm spawns the server as a child process, but does not pass received exit signals. By changing the last line in the `dockerfile` to `CMD [ "node", "src/server.js" ]`, Node.js is called directly and thus removes npm from this process. Now repeating the test from before: running the server with docker and exiting gives the expected `Closing server` output, hooray!

You may have noticed we are not handling the `SIGTERM` signal. The `SIGTERM` event is a termination signal and `SIGINT` is an interruption signal. Both tell the process to gracefully shutdown. Difference being when they are sent. In this case `SIGINT` is sent when quitting from the terminal. `SIGTERM` is sent when stopping a container running in the background, so without listening to `SIGTERM` running the following will not shut down correctly:
```
docker run --detach --name server server
docker stop server
```

Listening to both exit signals fixes this:
```js
['SIGINT', 'SIGTERM'].forEach(function(signal) {
  process.on(signal, function() {
    console.log('Closing server');
    server.close(process.exit);
  });
});
```

Now the server handles both exit signals, it will not drop open connections. Whether it is a manual restart or when the server exits because of scaling, with a container management service like Kubernetes. No user is stuck in an infinite loading state.
