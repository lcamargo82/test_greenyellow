FROM node:22

WORKDIR /app

RUN usermod -u 1000 node && groupmod -g 1000 node

RUN npm install -g @nestjs/cli

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["tail", "-f", "/dev/null"]
