#!/usr/bin/env node
// Bluesky engagement CLI via the AT Protocol (Buffer's API is publish-only, so
// likes/replies must go through Bluesky directly).
//
// Auth: set BSKY_APP_PASSWORD (create at bsky.app -> Settings -> Privacy & Security
// -> App Passwords). Never use the main account password. BSKY_IDENTIFIER defaults
// to jonesrussell.bsky.social.
//
// Commands:
//   notifications [--hours 26]        List recent replies/mentions/quotes as JSON lines
//   thread --uri <at-uri>             Show a post and its context (for composing replies)
//   like --uri <at-uri>               Like a post
//   reply --uri <at-uri> --text "…"   Reply to a post (root resolved automatically)
//   search --q "…" [--limit 10]       Search recent posts (for community engagement)

const PDS = "https://bsky.social/xrpc";
const IDENTIFIER = process.env.BSKY_IDENTIFIER ?? "jonesrussell.bsky.social";

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

if (!process.env.BSKY_APP_PASSWORD) {
  die("BSKY_APP_PASSWORD is not set. Create an app password at bsky.app -> Settings -> Privacy & Security -> App Passwords.");
}

const session = await xrpc("com.atproto.server.createSession", {
  method: "POST",
  body: { identifier: IDENTIFIER, password: process.env.BSKY_APP_PASSWORD },
  auth: false,
});

async function xrpc(nsid, { method = "GET", params, body, auth = true } = {}) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${PDS}/${nsid}${qs}`, {
    method,
    headers: {
      ...(auth ? { Authorization: `Bearer ${session.accessJwt}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) die(`${nsid} -> HTTP ${res.status}: ${json.message ?? JSON.stringify(json)}`);
  return json;
}

async function getPost(uri) {
  const res = await xrpc("app.bsky.feed.getPosts", { params: { uris: uri } });
  if (!res.posts?.length) die(`post not found: ${uri}`);
  return res.posts[0];
}

const compact = (p) => ({
  uri: p.uri,
  author: p.author?.handle,
  text: (p.record?.text ?? "").replace(/\s+/g, " "),
  likes: p.likeCount,
  replies: p.replyCount,
});

switch (cmd) {
  case "notifications": {
    const hours = Number(opt("hours", "26"));
    const since = Date.now() - hours * 3600_000;
    const res = await xrpc("app.bsky.notification.listNotifications", {
      params: { limit: "100" },
    });
    const wanted = new Set(["reply", "mention", "quote"]);
    const items = res.notifications
      .filter((n) => wanted.has(n.reason) && new Date(n.indexedAt).getTime() >= since)
      .map((n) => ({
        reason: n.reason,
        author: n.author.handle,
        indexedAt: n.indexedAt,
        uri: n.uri,
        text: (n.record?.text ?? "").replace(/\s+/g, " "),
        isRead: n.isRead,
      }));
    console.log(JSON.stringify(items, null, 1));
    break;
  }

  case "thread": {
    const uri = opt("uri") ?? die("--uri required");
    const res = await xrpc("app.bsky.feed.getPostThread", { params: { uri, depth: "3", parentHeight: "3" } });
    const t = res.thread;
    if (t.parent?.post) console.log("PARENT:", JSON.stringify(compact(t.parent.post)));
    console.log("POST:  ", JSON.stringify(compact(t.post)));
    for (const r of t.replies ?? []) if (r.post) console.log("REPLY: ", JSON.stringify(compact(r.post)));
    break;
  }

  case "like": {
    const uri = opt("uri") ?? die("--uri required");
    const post = await getPost(uri);
    if (post.viewer?.like) { console.log(`already liked: ${uri}`); break; }
    await xrpc("com.atproto.repo.createRecord", {
      method: "POST",
      body: {
        repo: session.did,
        collection: "app.bsky.feed.like",
        record: {
          $type: "app.bsky.feed.like",
          subject: { uri: post.uri, cid: post.cid },
          createdAt: new Date().toISOString(),
        },
      },
    });
    console.log(`liked: @${post.author.handle}: ${(post.record?.text ?? "").slice(0, 60)}`);
    break;
  }

  case "reply": {
    const uri = opt("uri") ?? die("--uri required");
    const text = opt("text") ?? die("--text required");
    if ([...text].length > 300) die(`reply is ${[...text].length} chars; Bluesky max is 300`);
    const parent = await getPost(uri);
    const root = parent.record?.reply?.root ?? { uri: parent.uri, cid: parent.cid };
    const res = await xrpc("com.atproto.repo.createRecord", {
      method: "POST",
      body: {
        repo: session.did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text,
          reply: { root, parent: { uri: parent.uri, cid: parent.cid } },
          createdAt: new Date().toISOString(),
        },
      },
    });
    console.log(`replied to @${parent.author.handle}: ${res.uri}`);
    break;
  }

  case "search": {
    const q = opt("q") ?? die("--q required");
    const limit = opt("limit", "10");
    const res = await xrpc("app.bsky.feed.searchPosts", { params: { q, limit, sort: "latest" } });
    console.log(JSON.stringify(res.posts.map(compact), null, 1));
    break;
  }

  default:
    die(`unknown command: ${cmd ?? "(none)"}. Commands: notifications, thread, like, reply, search`);
}
