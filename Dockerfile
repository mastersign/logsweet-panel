FROM node:8-alpine

COPY . /app
WORKDIR /app
RUN npm install

ENV LOGSWEET_PANEL_HOST 0.0.0.0
ENV LOGSWEET_PANEL_PORT 80
EXPOSE 80

CMD ["node", "index.js"]
