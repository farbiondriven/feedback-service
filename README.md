# feedback-service
A TypeScript REST micro-service that accepts customer feedback, saves it to a database, and asynchronously classifies each comment as Good, Neutral, or Bad.

Deployed at:
App:	    https://feedback-system-382890220864.europe-west1.run.app
OpenAPI:	https://feedback-system-382890220864.europe-west1.run.app/docs/

## 1  System overview

| Step | What happens |
|------|--------------|
| **1. Public POST** → **`/api/feedback`** | Any user submits a plain-text string. |
| **2. Async sentiment** | A worker thread classifies the text using _NLP_ (0-20 s for very long passages) so the HTTP response is instant. |
| **3. Persist** | Text, sentiment and timestamp saved via Prisma into Neon Postgres. |
| **4. Admin view** | A password protected page for administrators showing every submission saved |

---

## 2  Backend stack

| Concern | Library | Rationale |
|---------|---------|-----------|
| HTTP & routing | **Fastify** | Small, schema-driven |
| ORM / migrations | **Prisma** | Type-safe SQL, simple Neon deploys. |
| Sentiment NLP | **wink-nlp** | JS-only polarity scoring, lightweight. |

Fastify serves Swagger-UI at `/docs`

---

## 3  Frontend stack

* **Vite + React (SPA)** – built bundle lives under `/usr/share/nginx/html`.
* Pages  
  * `/`   public feedback form  
  * `/admin`   password box + “Load feedback”  
  * `/docs`   Swagger-UI
* NGINX proxies  
  * `/api/*` → Fastify  
  * `/docs/*` → Fastify  
  * everything else → SPA files

---

## 4  CI (GitHub Actions)

For every Pull request CI runs on github actions to make sure changes won't break existing functionality or standards.

## Feedback-Sentiment Demo

One-container proof-of-concept that lets anyone post feedback, classifies
its sentiment in the background, stores everything in Postgres and lets an
admin browse the results.  
Runs entirely on Google Cloud’s always-free tier.

# Routing diagram
```mermaid
graph TD
    subgraph Cloud Run container
        NGINX[NGINX<br/>8080]
        Fastify[Fastify API<br/>9000]
        Worker[worker_threads]
    end
    Browser((Browser))
    DB[(Neon Postgres)]

    Browser -->|/ (SPA)| NGINX
    Browser -->|/admin (SPA)| NGINX
    Browser -->|/docs/*| NGINX
    Browser -->|/api/*| NGINX

    NGINX -->|proxy /docs/*| Fastify
    NGINX -->|proxy /api/*| Fastify
    Fastify -->|enqueue| Worker
    Worker -->|insert & update| DB
```
