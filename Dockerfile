FROM ruby:3.2

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && apt-get clean

# Install Jekyll and Bundler
RUN gem install bundler jekyll

# Set working directory
WORKDIR /usr/src/app

# Copy files into container
COPY . .

# Install Bundle
RUN bundle install

# Build Jekyll
RUN bundle exec jekyll build

# Expose port for Jekyll server
EXPOSE 4000

# Start Jekyll server
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]