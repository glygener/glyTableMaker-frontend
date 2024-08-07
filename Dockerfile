# build environment
FROM node:20.9.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
# install git
RUN apk update && \
    apk upgrade && \
    apk add git

RUN npm install npm-force-resolutions --save-dev
RUN npm install 
RUN npx npm-force-resolutions
RUN npm install --silent
RUN npm install react-scripts@3.4.0 -g --silent
RUN npm install --save-dev ajv
COPY . /app
RUN npm run build

# production environment
FROM nginx:1.25.3-alpine
COPY --from=build /app/build /var/www
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
