# Commands
# docker run -it --rm -p 1890:1890 --name test test 
# docker build -f ./Dockerfiles\build-from-source.dockerfile -t test:latest .
# docker buildx build --platform linux/arm64 -f ./Dockerfiles\build-from-source.dockerfile -t armtest:latest .

# # -------------------- Build Tensorflow --------------------
# Specify a base image
FROM ubuntu:18.04 AS tf-stage

# Setup the build args
ARG BAZEL_VERSION=3.1.0
ARG TF_VERSION=2.3

# Install build tools
RUN apt-get update -y && apt-get install -y gcc-7 g++-7 build-essential openjdk-11-jdk python python3-dev python3-pip zip unzip wget git bash

# Build Bazel from source
WORKDIR /tmp/bazel
RUN echo ${BAZEL_VERSION}
RUN wget https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-dist.zip
RUN unzip bazel-${BAZEL_VERSION}-dist.zip
RUN /bin/bash ./compile.sh
# RUN env EXTRA_BAZEL_ARGS="--host_javabase=@local_jdk//:jdk" bash ./compile.sh
RUN cp /tmp/bazel/output/bazel /usr/local/bin/bazel

# Get ready to build tensorflow
WORKDIR /tmp
RUN pip3 install cython 
RUN pip3 install numpy wheel
RUN pip3 install keras_preprocessing --no-deps
RUN git clone https://github.com/tensorflow/tensorflow.git

# Build Tensorflow from source
WORKDIR /tmp/tensorflow
RUN git checkout r${TF_VERSION}
RUN ./configure
RUN bazel build -j 2 --config=opt --config=monolithic //tensorflow/tools/lib_package:libtensorflow

# # -------------------- Build NPM packages --------------------
# Specify a base image
FROM node:15-stretch AS npm-stage

# Setup the build args
ARG FACE_API_VERSION=0.21.0
ARG TFJS_NODE_VERSION=1.2.1

# Install build tools
RUN apt-get update -y && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Change working dir
WORKDIR /usr/app

# Install NPM packages individually
RUN npm install express
RUN npm install multer
RUN npm install express-list-endpoints
RUN npm install --build-from-source canvas 
RUN npm install face-api.js@${FACE_API_VERSION}
RUN npm install @tensorflow/tfjs-node@${TFJS_NODE_VERSION}

# Copy in the tensorflow binaries from previous stage
WORKDIR /usr/app/node_modules/@tensorflow/tfjs-node/deps
COPY --from=tf-stage /tmp/tensorflow/bazel-bin/tensorflow/tools/lib_package/libtensorflow.tar.gz .
RUN tar -xf libtensorflow.tar.gz
RUN rm libtensorflow.tar.gz

# -------------------- Application -------------------- 
# Specify a base image
# FROM node:15-stretch AS app

# Install Required Packages
# RUN apt-get update -y && apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Change into the app folder
WORKDIR /usr/app

# Copy in NPM packages
# COPY --from=npm-stage /usr/app/node_modules ./node_modules

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