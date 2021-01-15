# Specify a base image
FROM node:15 AS build 

# Install build tools
RUN apt-get update -y && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Change working directory
WORKDIR /usr/app

# Install NPM packages individually
RUN npm install --build-from-source canvas
RUN npm install face-api.js@0.21.0
RUN npm install @tensorflow/tfjs-node@1.2.11

# Set up env variables
ENV WEIGHTS_PATH='./weights'
ENV FACES_FOLDER='./faces'
ENV DETECTION_FOLDER='./detections'
ENV DESCRIPTOR_SAVE_PATH='./'
ENV USE_TF='true'

# Copy in the app and weights
COPY ./descriptor_creator /usr/app
COPY ./app/weights /usr/app/weights

# Run the descriptor creator
RUN node descriptor-creator.js

# Export the descriptors
FROM scratch AS export
COPY --from=build /usr/app/descriptors.json /descriptors.json
COPY --from=build /usr/app/detections /detections

# From root of this repo:
# docker buildx build -f build-descriptors.dockerfile -o descriptor_creator .