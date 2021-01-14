# Specify a base image
FROM node:15

# Install build tools
RUN apt-get update -y && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Change working directory
WORKDIR /usr/app

# Install NPM packages individually
RUN npm install express
RUN npm install multer
RUN npm install express-list-endpoints
RUN npm install --build-from-source canvas 
RUN npm install face-api.js@0.21.0
RUN npm install @tensorflow/tfjs-node@1.2.11

# Setup the environmental varibles 
ENV PORT=1890
ENV USE_TF='true'
ENV WEIGHTS_PATH='./weights'
ENV DESCRIPTOR_PATH='./descriptors.json'
ENV MODEL_OPTIONS='{"model":"ssd","minConfidence":0.6}'
ENV DETECTION_OPTIONS='{}'

# Copy in application files and folders
COPY ./app /usr/app

# Start app.js with node
CMD ["node","app.js"]