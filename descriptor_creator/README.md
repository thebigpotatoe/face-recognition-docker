# Creating Descriptors  

In order to use the facial recognition features of this image, descriptors need to be provided to the application to match against. These descriptors are calculated values of known faces using face-api.js. These need to be generated before and passed to a running container via several methods as described.

## Setup the descriptor_creator directory

In the folder `./descriptor_creator` exists a simple script `descriptor-creator.js` which when run creates a `descriptor.json` file.

There are two critical folders under `./descriptor_creator`. The `faces` dir where you need to place labelled folders for each person you wish to recognise. In each labelled folder can reside as many photos of that person for recognition. As an example the repo comes with Penny and Sheldon folders for testing

The `detections` is where the recognised faces are saved for validation to make sure the algorithm managed to find a good face.

By default, the repo structure should look like this before running the scripts;

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

To run the script you will either need `nodejs` installed or another way of running the script such as in its own docker container even.

Then simply clone the repository, install the requirements from the `package.json`, then run the script from inside the `./descriptor_creator` directory;

### Setup repo

``` bash
$: git clone https://github.com/thebigpotatoe/face-recognition-docker.git
$: cd face-recognition-docker
$: npm i
```

### Run script

``` bash
$: cd descriptor_creator
$: node descriptor-creator.js
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

## TODO

- Create a docker build script to compute the descriptors for an isolated environment
