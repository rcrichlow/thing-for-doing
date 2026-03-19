FROM ruby:3.4-slim

RUN apt-get update -qq && apt-get install -y build-essential libpq-dev libyaml-dev

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

RUN mkdir -p tmp/pids

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
