# Grab the latest Node base image
FROM node:latest

# Set the current working directory inside the container
WORKDIR /usr/src/notangles

# Copy package.json and package-lock.json into the container
COPY package.json yarn.lock ./

# Install node modules inside the container using the copied package.json
RUN yarn install

# Copy the entire project into the container
COPY . .

# Build the project
RUN yarn build

# Expose the port to the outside world
EXPOSE 8080

# Run the server
CMD ["yarn", "start:production"]
