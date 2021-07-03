FROM node:16-alpine

WORKDIR /app

# Install server
RUN apk add --no-cache caddy
COPY ["Caddyfile", "./Caddyfile"]

# Install app dependencies
COPY ["package.json", "package-lock.json", "./"]
RUN ["npm", "ci", "--ignore-scripts", "--no-audit"]

# Bundle app source
COPY ["./src/", "./src/"]
COPY ["./gulpfile.js", "./gulpfile.js"]
ENV NODE_ENV production
RUN ["npm", "run", "build"]

EXPOSE ${PORT:-443}
ENV DOMAIN selwyn.cc
CMD ["caddy", "run"]
