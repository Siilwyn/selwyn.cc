FROM node:8

# Install app dependencies
RUN apt update && apt install -y autoconf libtool pkg-config nasm build-essential
COPY package.json .
RUN npm install

# Bundle app source
COPY src ./src
COPY gulpfile.js .

CMD ["npm", "run", "build"]
