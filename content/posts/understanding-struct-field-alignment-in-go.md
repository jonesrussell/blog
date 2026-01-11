---
title: "Understanding Struct Field Alignment in Go"
categories: [golang, performance]
tags: [golang, memory, optimization, performance]
summary: "Learn how struct field ordering impacts memory usage in Go and how to optimize it."
slug: "understanding-struct-field-alignment-in-go"
draft: true
---

## Introduction

When working with Go structs, the way fields are ordered can significantly impact memory usage. Let's explore how struct field alignment works and how to optimize it.

## The Basics of Memory Alignment

```go
// Bad alignment (72 bytes total)
type BadStruct struct {
    name    string      // 16 bytes (string header: ptr + len)
    enabled bool        // 1 byte + 7 bytes padding
    items   []int       // 24 bytes (slice header: ptr + len + cap)
    config  *Config     // 8 bytes (pointer)
}
```

### Memory Sizes in Go

- bool: 1 byte
- int/uint: 8 bytes on 64-bit systems
- pointer: 8 bytes on 64-bit systems
- string: 16 bytes (two 8-byte words)
- slice: 24 bytes (three 8-byte words)
- interface: 16 bytes (two 8-byte words)

## Optimizing Field Order

```go
// Good alignment (40 bytes total)
type GoodStruct struct {
    items   []int       // 24 bytes (largest first)
    name    string      // 16 bytes
    config  *Config     // 8 bytes
    enabled bool        // 1 byte (smallest last)
}
```

### Rules for Optimal Alignment

1. Place larger fields first
2. Group similar-sized fields together
3. Put smaller fields last
4. Consider using embedded structs for better packing

## Tools and Detection

Go provides tools to help identify suboptimal field alignment:

- `go vet`: Includes field alignment checks
- golangci-lint: Provides the `fieldalignment` linter
- Example command: `go vet -fieldalignment ./...`

## Impact on Performance

While memory savings might seem small for individual structs, the impact can be significant when:

- Creating many instances of the struct
- Working with memory-constrained environments
- Dealing with cache line optimization
- Managing large data structures

## Best Practices

1. Use the `fieldalignment` linter
2. Document field sizes with comments
3. Consider alignment when designing new structs
4. Test memory usage with benchmarks
5. Profile your application to identify memory bottlenecks

## Conclusion

Proper field alignment is a subtle but important aspect of Go performance optimization. By understanding and applying these principles, you can write more memory-efficient code without sacrificing readability or maintainability.
