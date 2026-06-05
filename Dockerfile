# node:10 ships Python 2.7 + a build toolchain, which node-sass/node-gyp
# need to compile against. Do NOT bump this to a newer Node — Angular 7's
# native deps will not build on modern toolchains.
FROM node:10

# Angular CLI 7 to match the Angular 7 project.
RUN npm install -g @angular/cli@7

WORKDIR /app

EXPOSE 4200
