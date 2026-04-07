---
title: Building low-level software with only coding agents
date: 2026-04-05
tags:
  - 文章
cover: https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop
publish: true
---

In five days over the holiday break, I built a Rust-based image compressor from scratch using nothing but AI coding agents.

I wanted to see how far I could go using only coding agents to build something genuinely difficult — something that required deep systems knowledge I didn't have. Not a web app, not a CRUD tool, but real low-level software that pushes bits around.[^1] I documented the entire process from start to finish, and the results surprised me.

My library, `pixo`, has zero runtime dependencies and compiles to WebAssembly. It handles PNG, JPEG, and WebP formats with quality comparable to established tools like `libpng` and `mozjpeg`. The benchmarks show it's competitive with — and in some cases faster than — tools that took teams years to build.[^2]

I didn't expect this to work, and then was continually shocked at how capable the agents were at handling complex algorithmic challenges that would have taken me weeks to understand on my own.

Here's a few interesting things coding agents did for me:

1. Implemented a complete Huffman coding tree from scratch for JPEG compression
2. Built a custom PNG filter selection algorithm that analyzes entropy per scanline
3. Discovered and fixed a subtle endianness bug in the WebP bitstream writer
4. Optimized the DCT transform using SIMD intrinsics for a 3x performance boost
5. Created a comprehensive test suite comparing output against reference implementations
6. Debugged a memory corruption issue by tracing through raw pointer arithmetic

Let me first show you what I built (you can try it out [here](https://example.com)). This is `pixo` running entirely in your browser via WebAssembly:

<video src="https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1100&h=600&fit=crop" autoplay loop muted playsinline controls></video>

You can choose between different presets (faster or slower) depending on whether you prioritize speed or compression ratio. The default preset hits a sweet spot for most use cases.

## Finding the limits of coding agents

In my [last post](https://example.com), I talked about migrating a complex Next.js website using coding agents. That project was large in scope but familiar in territory — I knew React, I knew the frameworks involved.

However, this was in a domain I was comfortable with. I wanted to push further into unknown territory.

I wanted to try something really ambitious.

1. Build a library in a language I'm not an expert in — Rust
2. Tackle a domain that requires deep algorithmic knowledge — image compression

Image compression felt like the right opportunity to stress-test the capabilities of modern coding agents in unfamiliar territory.

There's 70 years of clever algorithms and optimizations baked into the image compression landscape, from Shannon's information theory to modern perceptual quality metrics.

There are *many* existing compression libraries that represent decades of careful engineering. Tools like pngquant, oxipng, mozjpeg, and libwebp have been refined by experts who deeply understand both the formats and the hardware.

This ended up being almost 38,000 lines of code across the encoder, decoder, WASM bindings, CLI tool, and benchmark suite.

## Long running agents

Most software engineers are not yet coding primarily with agents. They still write most of their code by hand, using AI as an autocomplete.

For those who have adopted coding agents, many treat them like a faster junior developer — useful for boilerplate, but not trusted with architecture.

Very few developers have updated their mental model to match what agents can actually do today.

Coding with AI looks dramatically different today than it did even six months ago:

1. **Models have improved dramatically.** The latest generation of models can hold vastly more context, reason about complex codebases, and produce code that compiles and passes tests on the first try far more often than before
2. **Coding agents have improved their tooling.** They can now run commands, read files, search codebases, create branches, and iterate on their own work — not just generate text in a chat window
3. **Awareness and adoption has increased across the industry.** Teams are sharing workflows, prompt libraries, and best practices. The ecosystem of tools around AI-assisted development is maturing rapidly

Today, agents and the latest models can easily run for 30 minutes to several hours, iterating on complex problems without human intervention.

My longest agent session ran for 3 hours, during which it implemented the entire JPEG decoder pipeline, wrote tests, found bugs, and fixed them — all autonomously.

## Planning, building, refactoring

Here's the initial plan I started `pixo` with. I used [Cursor's plan mode](https://example.com) to outline the [architecture](https://example.com) before writing any code:

<div class="img-grid">

![Mermaid architecture diagram showing the module structure of the image compression library](https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=550&h=400&fit=crop)

![Mermaid flow diagram showing the compression pipeline from input to output](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=550&h=400&fit=crop)

</div>

Throughout the project, I flipped between different models depending on the task. Opus for architecture decisions, Sonnet for rapid iteration on implementation details.

A large portion of this project was built using background agents that ran autonomously while I reviewed their work asynchronously.

The agent spins up an isolated environment, reads the codebase, creates a plan, implements the changes, runs tests, and opens a pull request for review.

For example, here's one of the first pull requests the agent created, implementing the core PNG encoder from scratch:

![GitHub pull request showing the initial PNG encoder implementation with 47 files changed](https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1100&h=600&fit=crop)

Now you might be thinking: how do you ensure quality when you're not writing the code yourself? It's a fair question.

If you give coding agents verifiable outputs — a test suite, benchmarks, reference images to compare against — they can [iterate autonomously](https://example.com) until the output meets your quality bar.

Here's a short list of things agents could verify on their own during this project:

1. Round-trip encoding and decoding produces identical output compared to [reference implementations](https://example.com) — the agent ran [pixel-by-pixel comparisons](https://example.com) automatically
2. Compression ratios match or beat baseline tools like [oxipng](https://example.com) — verified with [automated benchmarks](https://example.com) on a standard test corpus
3. SSIM and PSNR metrics stay above thresholds for [lossy formats](https://example.com) — the agent tracked perceptual quality across hundreds of test images
4. Memory usage stays within bounds during [streaming operations](https://example.com) — profiled with Valgrind and [custom allocator hooks](https://example.com)
5. WASM binary size stays under 200KB gzipped using [wasm-opt](https://example.com) — the agent [configured](https://example.com) the build pipeline to check this on every commit
6. Performance regression tests pass on [CI](https://example.com) — the agent set up [Criterion benchmarks](https://example.com) that fail if any operation slows down by more than 5%

The agent also helped me find and fix tricky visual bugs. Here's an example where it identified banding artifacts in gradient regions of compressed PNGs:

![Screenshot showing visual artifacts in a compressed gradient image, with the agent's analysis overlay highlighting the affected regions](https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1100&h=600&fit=crop)

After making the repo public, someone [opened an issue](https://example.com) requesting support for animated PNG (APNG). I was curious whether an agent could handle this.

I created a plan to explore what the API shape would look like, how frame disposal and blending operations would work, and what the expected output format should be.

Before merging the PR, I improved performance by [parallelizing](https://example.com) frame encoding and added a [streaming API](https://example.com) for processing large animations without loading everything into memory.

It's worth noting that I did [review most code](https://example.com) before merging. The agent is fast, but it occasionally makes subtle mistakes that only become apparent when you understand the full picture.

## Benchmarks and comparisons

I made a detailed benchmark against other similar tools using the [Kodak test suite](https://example.com) and [additional high-resolution images](https://example.com). The full benchmark methodology and raw data are available in the repository.[^3]

Some interesting stats and takeaways:

1. **PNG compression** — `pixo` achieves within 2% of oxipng's compression ratio while being 1.4x faster on average. On images with large flat regions, our custom filter selection actually beats oxipng by 3-5% due to entropy-based adaptive filtering
2. **JPEG encoding** — At quality 85, `pixo` produces files that are 8% smaller than mozjpeg with equivalent SSIM scores. The tradeoff is that encoding is roughly 20% slower, though we're working on [SIMD optimizations](https://example.com) that should close this gap
3. **WebP support** — Our WebP encoder is the youngest and least optimized. It produces files roughly 5% larger than `libwebp` at equivalent quality settings. However, the pure-Rust implementation means zero C dependencies and straightforward `wasm-pack` compilation

## Product matters more than ever

Writing code is no longer the bottleneck. Anyone can generate thousands of lines of code in minutes. The hard part is knowing what to build.

You have to figure out the right things to build, and then build them with taste. Here are some questions I asked myself throughout this project:

- **What compression presets should be available?**
  - I studied how real users interact with image tools: most want "just make it smaller" without thinking about formats or quality levels
- **How should the CLI handle errors?**
  - A corrupted input file should produce a clear, actionable error message — not a Rust panic with a backtrace that means nothing to most users
- **What should the default quality setting be?**
  - I ran perceptual tests with 20 different images and found that quality 82 for JPEG and effort 4 for PNG hit the sweet spot for most use cases
- **How should the web UI present progress?**
  - Compression of large files can take several seconds. A simple progress bar isn't enough — users want to see the size reduction in real-time
- **Should the library prioritize speed or compression ratio?**
  - After talking to potential users, I chose to offer three presets: fast, balanced, and maximum, with balanced as the default

You need to design a well-engineered system that handles edge cases gracefully, provides clear feedback, and makes the common case effortless.

Becoming a generalist is more important than ever. I needed to understand [color science](https://example.com), signal processing, UX design, and Rust's ownership model — not because I implemented everything from scratch, but because I needed to [guide the agent](https://example.com) and review its work with informed judgment.

To illustrate my point, this was the first version of the web application that the agent produced. Functional, but clearly not designed with any product sense:

![Screenshot of the first version of the pixo web app showing a basic file upload form with no styling or visual feedback](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1100&h=600&fit=crop)

Especially when you look at other similar tools that have invested *heavily* in their user experience, the gap becomes obvious. Design and product thinking are what differentiate good software from forgettable software.

This is the top result when you search for "png compress" — notice how slow and cluttered the experience is:

<video src="https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=450&fit=crop" autoplay loop muted playsinline controls></video>

It takes about 30 seconds to compress a single file. How about 3 seconds instead?

<video src="https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=450&fit=crop" autoplay loop muted playsinline controls></video>

## Conclusion

I learned a lot about image compression, Rust, and WASM through this project. More importantly, I learned about [how to work with agents](https://example.com) effectively. The `pixo` library is now open source and available on `crates.io`.[^4]

There's a lot of [discussion online](https://example.com) about whether AI will replace programmers. I think this misses the point entirely. The question isn't whether agents can write code — they clearly can — it's whether you can direct them effectively.

Similarly, workflows didn't emerge until I played around with different models, experimented with [plan-then-execute patterns](https://example.com), and learned when to use `background agents` versus interactive sessions. You have to develop intuition through practice.

I highly encourage anyone who writes code today to try building something outside your comfort zone using only coding agents. You'll learn more about both the technology and your own working style than you expect.

If you want to try out `pixo`, you can find it [here](https://example.com). The source code is on [GitHub](https://example.com), and the library is published on [crates.io](https://example.com). Feel free to open issues or contribute.

[^1]: I'm defining "coding agents" broadly here — any AI tool that can read your codebase, execute commands, and iterate on its own output. This includes tools like Cursor's agent mode, Claude Code, and similar assistants that go beyond simple chat-based code generation.

[^2]: The comparison is based on default settings for each tool. Every compression library has knobs you can tune to trade speed for ratio or vice versa. See the benchmarks section for methodology.

[^3]: Full benchmark data, methodology, and reproduction steps are available in the [repository's benchmark directory](https://example.com). I used the standard Kodak test suite plus 50 additional high-resolution photographs.

[^4]: The library is published under the MIT license. Contributions are welcome — see the contributing guide in the repository for details on how to get started.
