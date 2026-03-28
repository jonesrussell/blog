# Social copy: POSIX signal handling for graceful PHP queue workers

**Canonical URL:** https://jonesrussell.github.io/blog/posix-signal-handling-queue-workers/

## Facebook

Your PHP queue worker dies mid-job when systemd sends SIGTERM. Here's how to catch POSIX signals and finish the current job cleanly before shutting down. https://jonesrussell.github.io/blog/posix-signal-handling-queue-workers/ #PHP #Queues #Linux #DevOps

## X (Twitter)

SIGTERM kills your PHP queue worker mid-job. Catch it, set a flag, finish the job, then exit. Here's the pattern. https://jonesrussell.github.io/blog/posix-signal-handling-queue-workers/

## LinkedIn

When systemd or Kubernetes sends SIGTERM to your PHP queue worker, the default behavior is immediate termination. This post walks through a graceful shutdown pattern that lets the current job finish before the process exits. https://jonesrussell.github.io/blog/posix-signal-handling-queue-workers/
