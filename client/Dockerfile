# Grab the latest Node base image
FROM node:latest

# Set the current working directory inside the container
WORKDIR /server

# Copy packages.json and package-lock.json into the container
COPY package.json yarn.lock ./

# Install node modules inside the container using the copied package.json
RUN yarn install

# Copy the entire project into the container
COPY . .

# Build server and install npm serve
RUN yarn build
RUN npm install -g serve

EXPOSE 3000

# Run the server
CMD ["serve", "-s","build", "-l", "3000"]