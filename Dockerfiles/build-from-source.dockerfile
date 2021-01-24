# ----------------------- Comments -----------------------
# To select a version of Bazel and TensorFlow consult: https://www.tensorflow.org/install/source
# For building Bazel from scratch consult: https://docs.bazel.build/versions/master/install-compile-source.html#bootstrap-bazel
# For building libtensorflow from source consult: https://github.com/tensorflow/tfjs/tree/master/tfjs-node#optional-build-optimal-tensorflow-from-source
# 
# Notes:
# - Please check the ARG inputs for each stage for customisation of packages and source code
# - You will need at least 10GB of ram for comiplation, enable at least 8GB of swap for a raspberry pi with 2GB ram
# 
# ----------------------- Update Ubuntu -----------------------
# Import ubuntu base image
FROM ubuntu:18.04 AS ubuntu-common

# Install common dependancies
RUN apt-get update -y 
RUN apt-get install -y \
    ash \
    zip \
    unzip \
    wget \
    git \
    build-essential \
    openjdk-11-jdk \
    python \
    python3 \
    python3-dev \
    python3-pip

# ----------------------- Download Stage -----------------------
# Import ubuntu common image
FROM ubuntu-common AS download-stage

# Select versions of bazel and tf
ARG BAZEL_VERSION=3.1.0
ARG TF_VERSION=2.3

# Download the source code
WORKDIR /tmp
RUN mkdir bazel && cd bazel && wget https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-dist.zip
RUN git clone --single-branch --branch r${TF_VERSION} https://github.com/tensorflow/tensorflow.git

# ----------------------- Bazel Stage -----------------------
# Import ubuntu common image
FROM ubuntu-common AS bazel-build

# Setup build 
WORKDIR /tmp/bazel
COPY --from=download-stage /tmp/bazel .
RUN file=$(find . -iname \*.zip) && unzip -q $file && rm $file

# Build Bazel from source
RUN env EXTRA_BAZEL_ARGS="--host_javabase=@local_jdk//:jdk" bash ./compile.sh
# Compiled to: /tmp/bazel/output/bazel

# ----------------------- Tensorflow Stage -----------------------
# Import ubuntu common image
FROM ubuntu-common AS tf-build

# Setup the build args
ARG NUM_JOBS=2

# Import the Bazel binary 
COPY --from=bazel-build /tmp/bazel/output/bazel /usr/local/bin/bazel

# Install Python packages
RUN python3 -m pip --no-cache-dir install --upgrade "pip<20.3"
RUN pip3 --no-cache-dir install --upgrade setuptools
RUN pip3 --no-cache-dir install cython
RUN pip3 --no-cache-dir install numpy wheel
RUN pip3 --no-cache-dir install keras_preprocessing --no-deps
RUN pip3 --no-cache-dir install future

# Setup build
WORKDIR /tmp/tensorflow
COPY --from=download-stage /tmp/tensorflow .

# Build libtensorflow from source
RUN ./configure
RUN bazel build --jobs=${NUM_JOBS} \
    --config=opt \
    --config=monolithic \
    //tensorflow/tools/lib_package:libtensorflow
# Compiled to: /tmp/tensorflow/bazel-bin/tensorflow/tools/lib_package/libtensorflow.tar.gz

# ----------------------- App Stage -----------------------
# Use ubuntu as a base image
FROM ubuntu:18.04 as app-stage

# Select a node version
ARG NODE_VER=15

# Install required packages
RUN apt-get update -y && \
    apt-get install -y curl \
        build-essential \
        libcairo2-dev \
        libpango1.0-dev \
        libjpeg-dev \
        libgif-dev \
        librsvg2-dev

# Install node and npm 
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VER}.x | bash
RUN apt install -y nodejs

# Change working directory
WORKDIR /usr/app

# Install NPM packages individually
RUN npm init -y
RUN npm install express
RUN npm install multer
RUN npm install express-list-endpoints
RUN npm install --build-from-source canvas 
RUN npm install face-api.js@0.21.0
RUN npm install @tensorflow/tfjs-node@1.2.11

# Replace the binaries in the tfjs-node folder and rebuild it
WORKDIR /usr/app/node_modules/@tensorflow/tfjs-node/deps
COPY --from=tf-build /tmp/tensorflow/bazel-bin/tensorflow/tools/lib_package/libtensorflow.tar.gz .
RUN tar -xf libtensorflow.tar.gz && rm libtensorflow.tar.gz 
RUN npm rebuild @tensorflow/tfjs-node --build-from-source

# Setup the application environmental varibles 
ENV PORT=1890
ENV USE_TF='true'
ENV WEIGHTS_PATH='./weights'
ENV DESCRIPTOR_PATH='./descriptors.json'
ENV MODEL_OPTIONS='{"model":"ssd","minConfidence":0.6}'
ENV DETECTION_OPTIONS='{}'

# Copy in application files and folders
WORKDIR /usr/app
COPY ./app /usr/app
# COPY ./descriptor_creator/descriptors.json /usr/app/descriptors.json # Uncomment to back in descriptors

# Start app.js with node
CMD ["node","app.js"]