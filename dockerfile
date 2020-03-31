FROM node:10-slim

WORKDIR /app

# Install server
RUN apt update && apt install -y curl
RUN CADDY_TELEMETRY=on curl https://getcaddy.com | bash -s personal http.git,http.ratelimit
COPY ["caddyfile", "./Caddyfile"]

# Install app dependencies
COPY ["package.json", "package-lock.json", "./"]
RUN ["npm", "ci"]

# Bundle app source
COPY ["./src/", "./src/"]
COPY ["./gulpfile.js", "./gulpfile.js"]
ENV NODE_ENV production
RUN ["npm", "run", "build"]

EXPOSE ${PORT:-2015}
CMD ["caddy", "-root", "dist", "-agree"]