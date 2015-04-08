FROM iojs

WORKDIR /src

COPY ./ /src

RUN npm install

EXPOSE 3000

CMD DEBUG=accountinfo node --es_staging --harmony_arrow_functions bin/www
