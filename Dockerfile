FROM iojs

WORKDIR /src

COPY ./ /src

RUN npm install

EXPOSE 3000

CMD ./entrypoint.sh
