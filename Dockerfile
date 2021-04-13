# for local development and testing
# docker build -t lagosta-builder .
# docker run -it --rm --name lagosta-builder2 -v ${PWD}:/tmp/src lagosta-builder /bin/bash
# root@461a1df45f20:/tmp/src# yarn build

FROM ubuntu:18.04 as setup

# Use the same version of Yarn as the GitHub Actions hosted runner for Ubuntu 18.04 uses at the time of writing
# See: https://github.com/actions/virtual-environments/blob/main/images/linux/Ubuntu1804-README.md
ARG YARN_VER=1.22.5 
# Use Node 12.x as used by the Lagosta GitHub Actions build-dist.yml workflow
ARG NODE_VER=12.x

RUN apt-get update && apt-get install -y curl sudo
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VER} | sudo -E bash -
RUN apt-get install -y nodejs
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version ${YARN_VER}

# Run the export command that the Yarn install suggests
ENV PATH="/root/.yarn/bin:/root/.config/yarn/global/node_modules/.bin:$PATH"

# Expect the user to bind mount their Lagosta sources at /tmp/src
# After docker run -it the user can then run: yarn run build
WORKDIR /tmp/src