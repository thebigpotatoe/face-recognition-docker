# Creating Descriptors  

In order to use the facial recognition features of this image, descriptors need to be provided to the application to match against. These descriptors are calculated values of known faces using face-api.js. These need to be generated before and passed to a running container via several methods as described.

## Setup the descriptor_creator directory

Start by cloning the repo into a known location;

```console
$ git clone https://github.com/thebigpotatoe/face-recognition-docker.git
$ cd face-recognition-docker
```

In the folder `./descriptor_creator` exists a simple script `descriptor-creator.js` which when run via two methods creates a `descriptor.json` file.

There are two critical folders under `./descriptor_creator` for creating descriptors for known faces;

 - The `faces` folder where you need to place labelled folders for each person you wish to recognise. In each labelled folder can reside as many photos of that person for recognition. As an example the repo comes with Penny and Sheldon folders for testing

 - The `detections` folder is where the recognised faces from the descriptor creation process are saved for validation to make sure the algorithm managed to find a good face.

By default, the repo structure in `./descripor_creater/` should look like this before running the scripts;

```bash
├── descriptor-creator.js
├── detections
└── faces
    ├── Penny
    │   ├── Penny1.jpg
    │   ├── Penny2.jpg
    │   └── Penny3.jpg
    └── Sheldon
        ├── Sheldon1.jpg
        ├── Sheldon2.jpg
        └── Sheldon3.jpg
```

## Run descriptor-creator.js

### Using Docker 

Since you most likely have docker installed the easiest way to run the `descriptor-creators.js` script is with the docker build file in the root of this repo. Using the following commands runs a nodejs environment and exports the important files and folders;

> Note that buildx is required but supported out of the box by modern docker builds. If exporting the files does not work correctly or not produce any errors on failure you may need to find how to enable buildx on your machine. If you are having issues on your platform exporting the descriptors, look for how to use buildx on your platform.

```docker
docker buildx build -f ./Dockerfiles/build-descriptors.dockerfile -o descriptor_creator .
```

### Using Node JS

Alternatively if you have `nodejs` installed and want to run locally without docker then simply install the requirements from the `package.json`, then run the script from the root of the repo;

```console
$ npm i
$ node ./descriptor_creator/descriptor-creator.js
```

## Check Outputs

After running the script a `descriptors.json` file will be created and the labelled images will be places in the `detections` folder for examination. For the example case this would yield a directory that looks like this;

``` bash
├── descriptor-creator.js
├── descriptors.json
├── detections
│   ├── Penny
│   │   ├── detected-Penny1.jpg
│   │   ├── detected-Penny2.jpg
│   │   └── detected-Penny3.jpg
│   └── Sheldon
│       ├── detected-Sheldon1.jpg
│       ├── detected-Sheldon2.jpg
│       └── detected-Sheldon3.jpg
└── faces
    ├── Penny
    │   ├── Penny1.jpg
    │   ├── Penny2.jpg
    │   └── Penny3.jpg
    └── Sheldon
        ├── Sheldon1.jpg
        ├── Sheldon2.jpg
        └── Sheldon3.jpg
```

## Check descriptor.json

The `descriptors.json` file will then need to be passed to the running container in order to recognise faces. For this example, the descriptor file should look like the follow;

```json
[
  {
    "label": "Penny",
    "descriptors": [
      [
        0.004935374483466148,
        0.13959763944149017 ...
        // Truncated
      ],
      [
        -0.031847529113292694,
        0.16345374286174774 ...
        // Truncated
      ],
      [
        -0.011521504260599613,
        0.12391141802072525 ...
        // Truncated
      ]
    ]
  },
  {
    "label": "Sheldon",
    "descriptors": [
      [
        -0.10326651483774185,
        -0.0631253570318222 ...
        // Truncated
      ],
      [
        -0.04409155994653702,
        -0.009346582926809788 ...
        // Truncated
      ],
      [
        -0.11331755667924881,
        -0.05521100014448166 ...
        // Truncated
      ]
    ]
  }
]
```
