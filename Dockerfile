FROM ruby:2.7.1-buster AS build
COPY . /app
WORKDIR /app
RUN bundle install \
  && JEKYLL_ENV=production jekyll build

FROM nginx:1.19.2-alpine
COPY --from=build /app/_site /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf

LABEL name blog
LABEL version 1.0.4

EXPOSE 80