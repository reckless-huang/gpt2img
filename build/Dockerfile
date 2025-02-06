FROM node:18.20.3 AS build
WORKDIR /node/workspace
ADD . .
RUN npm i
#RUN sleep 3600
RUN npm run build
FROM nginx AS prod
COPY --from=build /node/workspace/build/dist /usr/share/nginx/fe
COPY --from=build /node/workspace/build/config/admin.conf /etc/nginx/conf.d
EXPOSE 18080
