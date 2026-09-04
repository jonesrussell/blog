## Bluesky

Mounting a volume right on the directory you chmod'd in the image throws that permission away. northway fixes it by baking a private child directory into the image and mounting the volume one level up instead. https://jonesrussell.github.io/blog/docker-sqlite-private-child-directory/ #docker

## LinkedIn

A container detail that is easy to get wrong: chmod and chown a directory in your Dockerfile, then mount a durable volume right on top of it, and you can lose that permission. A volume mount replaces whatever was at that path with the volume's own root, and that root does not always come back with the ownership your image set.

northway, a Go service with an embedded SQLite database, ran into exactly this with its non-root scratch container. The fix: stop putting the sensitive directory at the mount point. Bake a private child directory into the image instead, mount the volume one level up at the parent, and the ownership and mode set at build time survive no matter what the volume root looks like.

It is backed by a smoke test that builds the real image, mounts a disposable Docker volume, and runs migrate, serve, restart, and backup against the child path to prove the permissions hold under an actual mount, not just in a fresh container filesystem.

Full writeup: https://jonesrussell.github.io/blog/docker-sqlite-private-child-directory/

#docker #golang #sqlite #devops #security

## Facebook

Chmod a directory in your Dockerfile, then mount a volume right on top of it, and you can lose that permission the moment the volume's own root takes over. Here is how northway fixed it by baking a private child directory into the image instead. https://jonesrussell.github.io/blog/docker-sqlite-private-child-directory/

#docker #devops
