---
title: Exploring the serverless edge
description: A look at the serverless functions & edge workers.
date: "2021-11-18"
---

Serverless functions have been around for years but their ‘surroundings’ are still in flux. With a focus on developer experience: Firstly by making them easy to run and test locally by emulating the production environment. Secondly by integrating with Git, using automatic production and pull request deploys. Thirdly with service combinations, like static file hosting and analytics. These together make serverless functions more useful, but edge workers are starting to catch up.

Before diving in, let me clear up the two terms. With *serverless functions* I mean code paired with a runtime, both run on invocation. Think of services such as: Fn, AWS Lambda & Google Cloud Functions. With *edge workers* I mean code that runs in an within a specific runtime, for now only the [V8 engine](https://v8.dev/). Think of services such as: Deno Deploy, Cloudflare Workers & Netlify Edge.

## Chilly serverless
Cold starts are a major downside of serverless functions, you have to wait for the runtime to start and, depending on the language, parse the code. Even a serverless JavaScript function with only a few lines of code drags around 50ms - 100ms of [cold start](https://en.wikipedia.org/wiki/Serverless_computing#Performance). This number can go up quick when pulling in dependencies. On top of that you get network latency, the farther away from a user request the longer the latency. Though this is not a serverless downside per se it often is in practice. Most serverless function offerings only allow you to deploy to one region.

## Ablaze edge workers
In contrast edge workers usually run close to a user request. And since the runtime is already running there is no cold or warm start. An invocation takes a few of milliseconds or less. The runtime API is comparable to Service Workers and Web Workers, embracing the Web APIs we love and hate. Whereas serverless functions have access to the underlying system and file system, edge workers communicate with web APIs like caches and events. As a result JS packages on npm that assume access to run in Node.js will not work. On top of that edge workers can not make raw TCP connections, so talking to a database like Postgres is out of question.

## The bleeding edge
But last week Deno Deploy, an edge worker service, [published Beta 3](https://deno.com/blog/deploy-beta3). Actually adding support for raw TCP connection support! I expect other edge worker services to follow suit but until then there is [Prisma Data](https://cloud.prisma.io/) Proxy in early access. An edge worker can connect to the Prisma Data proxy over HTTP and in turn the proxy, acting as a connection pool, talks to a database.

With these changes it seems edge workers are catching up going beyond what a serverless function offers, exciting stuff!
