---
title: "Docker from Scratch: Shrink Your Images With Multi-Stage Builds"
date: 2026-03-03
categories: [docker]
tags: [docker, containers, nodejs, typescript]
series: ["docker-fundamentals"]
summary: "Use multi-stage Dockerfiles to separate build tooling from your runtime image, cutting image size by 90% or more."
slug: "docker-multi-stage-builds"
draft: false
---

Ahnii!

> **Prerequisites:** [Docker](https://docs.docker.com/get-docker/) installed, basic terminal knowledge. **Recommended:** Read [Part 1: Writing Your First Dockerfile]({{< relref "docker-dockerfile-fundamentals" >}}) first.

In [Part 1]({{< relref "docker-dockerfile-fundamentals" >}}), you built a working Dockerfile. It gets the job done, but the final image carries everything: source code, build tools, dev dependencies. This post covers [multi-stage builds](https://docs.docker.com/build/building/multi-stage/), which let you compile in one stage and run in another. Your production images get dramatically smaller.

## What Problem Do Multi-Stage Builds Solve?

Here's a typical single-stage Dockerfile for a [TypeScript](https://www.typescriptlang.org/) app:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

This works. But the final image includes TypeScript, your `src/` directory, all dev dependencies, and the entire npm cache. None of that is needed at runtime. You're shipping a toolbox when all you need is the finished product.

Check the size:

```bash
docker build -t myapp-single .
docker images myapp-single
```

You'll see something around 300-400MB. The actual compiled JavaScript might be a few kilobytes.

## How Multi-Stage Builds Work

A multi-stage Dockerfile uses multiple `FROM` instructions. Each `FROM` starts a new stage. You can copy files from one stage to another using `COPY --from=`.

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:22-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

Two stages, one Dockerfile. The `AS build` and `AS runtime` labels name each stage. `COPY --from=build` pulls the compiled output from the first stage into the second.

The runtime stage only has production dependencies and the compiled JavaScript. TypeScript, source files, dev dependencies, and the npm cache from the build stage are all gone.

## Step-by-Step Breakdown

### Stage 1: Build

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
```

This stage installs all dependencies (including dev), copies your source, and compiles TypeScript to JavaScript. The output lands in `dist/`.

### Stage 2: Runtime

```dockerfile
FROM node:22-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

This stage starts fresh from the same base image. It installs only production dependencies with `--omit=dev`, then copies the compiled output from the build stage. Everything else is left behind.

### The Key Line

```dockerfile
COPY --from=build /app/dist ./dist
```

This is what makes multi-stage builds work. You reference a previous stage by name (`build`) and pull specific files out of it. The build stage and everything in it gets discarded from the final image.

## Compare the Results

Build both versions and compare:

```bash
docker build -t myapp-single -f Dockerfile.single .
docker build -t myapp-multi -f Dockerfile.multi .
docker images --format "table {{.Repository}}\t{{.Size}}" | grep myapp
```

Typical results:

```
myapp-single    350MB
myapp-multi     150MB
```

That's a 57% reduction just by separating build from runtime. The gap gets even wider with larger projects that have more dev dependencies.

## Using a Smaller Runtime Base

You don't have to use the same base image for both stages. The build stage needs Node.js and npm. The runtime stage just needs Node.js.

```dockerfile
# Build with full tooling
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run with minimal image
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
```

The `npm cache clean --force` removes the npm cache from the runtime layer. `USER node` switches to the built-in non-root user that ships with the official Node.js images. Both trim the image further.

## When to Use Multi-Stage Builds

Multi-stage builds make sense when your build process produces artifacts that are smaller than the build environment:

- **TypeScript/JavaScript** projects that compile to plain JS
- **Frontend apps** where you build static assets with webpack or Vite, then serve with nginx
- **Any language with a compile step** (Go, Rust, Java) where the output is a binary or JAR

If your app runs directly from source with no build step (a plain Node.js server with no TypeScript, for example), a single stage is fine. Don't add complexity you don't need.

## Common Mistakes With Multi-Stage Builds

### Copying Too Much From the Build Stage

```dockerfile
# Bad — copies everything from build, including node_modules and source
COPY --from=build /app .
```

Be specific about what you copy. Only pull the compiled output:

```dockerfile
# Good — copies only what's needed
COPY --from=build /app/dist ./dist
```

### Installing Dev Dependencies in the Runtime Stage

```dockerfile
# Bad — installs everything
RUN npm install
```

Always use `--omit=dev` in the runtime stage:

```dockerfile
# Good — production dependencies only
RUN npm install --omit=dev
```

### Forgetting the .dockerignore

Multi-stage builds don't eliminate the need for a `.dockerignore`. The build context still gets sent to Docker before any stage runs. Keep `node_modules`, `.git`, and other unnecessary files out of the context.

## Try It Yourself

From the [companion repo](https://github.com/jonesrussell/docker-examples):

```bash
cd 02-multi-stage
docker build -t multi-stage-demo .
docker run -p 3000:3000 multi-stage-demo
curl http://localhost:3000
```

Check the image size and compare it to a single-stage build. The difference speaks for itself.

## What's Next

Part 3 switches to Python and covers security: running as a non-root user, choosing minimal base images, and keeping secrets out of your layers.

Baamaapii

---

**Want the complete guide?** All 5 parts of Docker from Scratch as a formatted ebook, plus a Dockerfile cheat sheet and 3 production-ready templates (Node.js, Python, Go). [Grab the bundle on Gumroad →](https://jonesrussell.gumroad.com/l/docker-from-scratch)
