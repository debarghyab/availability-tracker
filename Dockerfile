FROM node:10.13-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
RUN apk update && apk add yarn python g++ make git && rm -rf /var/cache/apk/*
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN yarn
COPY . .
COPY .babelrc ./
CMD yarn test