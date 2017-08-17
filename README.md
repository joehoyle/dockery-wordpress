## Run the docker-wordpress-base infrastructure locally.

## Installing

1. Clone this repo.
1. `cd /path/to/repo`
1. `npm install`
1. Link it globally with `npm link -g ./path/to/repo`.
1. Build `docker-wordpress-base` locally, so you have the image available.
1. Run `dockery-wordpress rebuild` to build the dockery-wordpress image.
1. `cd` to your project's root.
1. Run `dockery-wordpress init` to create a `.dockery-wordpress` file (similar to `npm init`) for example.
1. Run `dockery-wordpress install` (similar to `npm install`)
1. Run `dockery-wordpress start --verbose` to start the container.
