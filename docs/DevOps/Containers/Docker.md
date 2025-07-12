---
tags:
  - virtualization
  - containerization
  - operating-systems
author: Simão Silva
---

# Docker

---
This note is divided into two parts: the first, explaining more general and basic aspects of containers; and the latter one, covering the specifics of Docker.

In general, this note presents the general concepts and objectives of containerization, how it works, and how Docker works (both from a theoretical and pratical view point).

The contents of this note were based on [this video](https://www.youtube.com/watch?v=3c-iBn73dDE).

---

## Motivation for Containers and Docker

A common problem that existed in development lifecycles before container technology appeared was the problem of translating local development environments to production environments, i.e., a developer could develop a software application in its local environment and it works seamlessly there, but due to some problem, in the production environment something could be different, and the program did not maintain the same behviour as before.

Containers aim to solve this issue, by ensuring **reproducibiliaty** in the environment a given application or applications are running. Containers provide reproduceable environments, with all depedencies needed to run a given software application.

### Problems of running applications on bare metal?

- Dependency hell
- Large blast radius (problem on one application)
- Low resource utilization
- Slow start up and shutdown
- Very slow provisioning and decomissioning

### Problems of running applications on Virtual Machines?

## Containers

### What is a Container?

A container is a lightweight, standlone, package of software, that includes everything needed to run a given application. While similar to a VM in the sense that it runs on top of a host OS, it is much lighter than a VM, as the container shares the kernel with the host OS.

In the case of Docker, containers are specified in declarative build scripts (in Docker, `Dockerfiles`), facilitating the 

### Where do containers live?

### How do containers improve application development?

### Namespaces

### Cgroups

### Overlay filesystem

### Volume Mounts vs Bind Mounts

## Docker Cheatsheet

### Docker CLI

- `docker run`: The **docker run** command creates and runs a new container from an image
  - **Flags:**
    - `--interactive, -i`: Keeps the container's _stdin_ open, even when the container is not attached, i.e., there is no connection to it.
    - `--tty, -t`: Allocates a terminal to the container, so that output from the container is nicely formatted. It is often paited with `--interactive, -i` flag, so that commands can be issued to the container.
    - `--rm`: Removes the container after it is stopped.
    - `--volume, -v <SOURCE>:<TARGET>`: Mounts a volume or a bind mount to the container. Source is either the name of a volume (volume mount) or a path in the host (bind mount). Target is the path in the container where the volume should be mounted (data written to such path will be written to the volume).
    - `--mount type=<TYPE>, source=<SOURCE>, target=<TARGET>`: This flag is similar to the `--volume` flag, but here we can specify directly if it is as **volume** mount or **bind** mount.
    - `--publish, -p <HOST_PORT>:<CONTAINER_PORT>`: Maps a port of the container to listen at a particular port of the host.
- `docker volume`: Command that allows to manage volumes.
  - **Subcommands:**
    - `create <VOLUME_NAME>`: Creates a named volume. Depending on the OS and the setup being used, this volume can be stored in different places:
      - **Linux using Docker Engine setup:** Becaused runs natively on Linux (using Docker Engine), volumes are stored directly on the host machine at `/var/lib/docker/volumes/`.
      - **Windows, MacOS and Linux using Docker Desktop:** Docker Desktop creates a Linux VM where it runs its containers. Volumes are stored in the `/var/lib/docker/volumes/` folder of that VM.
- `docker image`:
- `docker network`:
  - **Subcommands:**
    - `ls`
    - `rm` (alias: `docker rmi`):
- `docker system`:
  - `df`
- `docker pull`:

### Dockerfiles

> `.dockerignore`: When using **COPY** command in a Dockerfile, Docker will not copy files present in this file (similar to .gitignore).

#### Instructions

- `ARG`
- `ENV`
- `RUN`
- `EXPOSE`
- `FROM`
- `COPY`
- `ENTRYPOINT`
- `WORKDIR`
- `CMD`
