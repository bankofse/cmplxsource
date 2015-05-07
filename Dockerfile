FROM iojs

RUN mkdir /src
WORKDIR /src
COPY package.json /src/package.json
RUN npm install
COPY app.js /src/app.js
COPY ./bin/ /src/bin
COPY ./config/ /src/config
COPY ./routes/ /src/routes
COPY ./web /src/web

EXPOSE 3000

CMD node --es_staging --harmony_arrow_functions bin/www
