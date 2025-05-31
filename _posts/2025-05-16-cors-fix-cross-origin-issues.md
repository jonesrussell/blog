---
layout: post
title: "CORS: Fix Cross-Origin Issues"
date: 2025-05-16
categories: [Go, Web Development]
tags: [CORS, API, Security, Go]
summary: "Learn how to properly implement CORS in your Go applications to handle cross-origin requests securely."
---

Ahnii!

CORS (Cross-Origin Resource Sharing) lets your API accept requests from different domains. Without it, browsers block cross-origin requests for security.

![CORS Diagram]({{ site.baseurl }}/assets/images/cors.png)

### The Problem

Browsers enforce same-origin policy. Different protocol, host, or port = different origin = blocked request.

Examples of different origins:

- `http://localhost:3000` and `http://localhost:8080` (different ports)
- `https://api.example.com` and `http://api.example.com` (different protocols)

### Quick Fix

Add this function to your handler:

```go
func enableCORS(w *http.ResponseWriter) {
    (*w).Header().Set("Access-Control-Allow-Origin", "*")
}
```

Call it in your handler:

```go
func handleAPI(w http.ResponseWriter, r *http.Request) {
    enableCORS(&w)
    
    // Your API logic here
    json.NewEncoder(w).Encode(data)
}
```

### Secure Implementation

Don't use `*` in production. Specify allowed origins:

```go
func enableCORS(w *http.ResponseWriter) {
    (*w).Header().Set("Access-Control-Allow-Origin", "https://yourdomain.com")
    (*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    (*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}
```

### Handle Preflight Requests

For non-simple requests (POST with custom headers, PUT, DELETE), browsers send OPTIONS requests first:

```go
func handleAPI(w http.ResponseWriter, r *http.Request) {
    enableCORS(&w)
    
    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }
    
    // Your API logic
}
```

### Production Setup

Use a dedicated CORS middleware like [rs/cors](https://github.com/rs/cors):

```go
import "github.com/rs/cors"

c := cors.New(cors.Options{
    AllowedOrigins: []string{"https://yourdomain.com"},
    AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
    AllowedHeaders: []string{"Content-Type", "Authorization"},
})

handler := c.Handler(http.HandlerFunc(yourHandler))
```

### Final Thoughts

CORS is a server-side solution. Set the headers on your API, not your frontend. Always be specific with your allowed origins in production, and consider using a battle-tested middleware like `rs/cors` for complex setups.

Got questions about CORS implementation? Drop a comment below!

Baamaapii 👋
