FROM node:8-alpine

COPY . /app
WORKDIR /app
RUN apk add --no-cache --virtual .gyp \
	python \
	make \
	gcc \
	g++ \
 && npm install \
 && apk del .gyp

ENV LOGSWEET_PANEL_HOST 0.0.0.0
ENV LOGSWEET_PANEL_PORT 80
EXPOSE 80

CMD ["node", "index.js"]
