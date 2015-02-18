FROM iojs

# Development Container
RUN npm install nodemon -g

WORKDIR /src

CMD bash
