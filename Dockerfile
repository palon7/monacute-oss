# Builder
FROM node:14-alpine
WORKDIR /app

COPY package*.json yarn.lock lerna.json ./
COPY apps/monacute-task/package*.json yarn.lock ./apps/monacute-task/
#COPY ./apps/monacute-task/prisma ./apps/monacute-task
COPY packages/ ./packages/
RUN ls
RUN yarn install && yarn lerna bootstrap
RUN cd /app/packages/monaparty && yarn build

COPY ./apps/ ./apps/
RUN yarn prisma:generate

WORKDIR /app/apps/monacute-task
RUN yarn build

WORKDIR /app
COPY ./entrypoint.sh ./

CMD ["/app/entrypoint.sh"]
