/**
 * Canonical seed data for InterPrep. Mirrors the CS-focused question banks
 * that originally lived in `src/lib/domains.js` on the frontend (the source
 * of truth now lives here in the backend).
 *
 * Edit this file → run `npm run seed` to refresh the database.
 */

export const DOMAINS = [
  {
    slug: 'dsa',
    label: 'Data Structures & Algorithms',
    shortLabel: 'DSA',
    blurb: 'Whiteboard-style algorithmic reasoning. Talk through approach, complexity, and edge cases — not syntax.',
    tagline: 'Reason out loud about complexity.',
    iconKey: 'Binary',
    accent: 'from-brand-400 to-cyan-400',
    skills: ['Arrays', 'Trees', 'Graphs', 'DP', 'Complexity'],
    order: 1,
  },
  {
    slug: 'system-design',
    label: 'System Design',
    shortLabel: 'System Design',
    blurb: 'High-level design of scalable systems. Capacity estimation, trade-offs, data modeling, partitioning, and availability.',
    tagline: 'Design for scale and trade-offs.',
    iconKey: 'Network',
    accent: 'from-violet-400 to-fuchsia-400',
    skills: ['Capacity', 'Sharding', 'Caching', 'CAP', 'Trade-offs'],
    order: 2,
  },
  {
    slug: 'frontend',
    label: 'Frontend Engineering',
    shortLabel: 'Frontend',
    blurb: 'React, JavaScript, browser internals, performance, and accessibility. Architecture-level reasoning, not trivia.',
    tagline: 'Architect on top of the browser.',
    iconKey: 'LayoutTemplate',
    accent: 'from-cyan-400 to-emerald-400',
    skills: ['React', 'JS', 'Perf', 'A11y', 'CSS'],
    order: 3,
  },
  {
    slug: 'backend',
    label: 'Backend Engineering',
    shortLabel: 'Backend',
    blurb: 'APIs, databases, concurrency, observability, and reliability. Practical decisions you have to defend.',
    tagline: 'Defend the decisions on the API side.',
    iconKey: 'Server',
    accent: 'from-amber-400 to-rose-400',
    skills: ['APIs', 'SQL', 'Caching', 'Concurrency', 'Reliability'],
    order: 4,
  },
  {
    slug: 'ml',
    label: 'Machine Learning',
    shortLabel: 'ML / AI',
    blurb: 'Modeling, evaluation, training pipelines, LLMs in production, and ML system design. Conceptual depth over jargon.',
    tagline: 'From data to deployed model.',
    iconKey: 'Brain',
    accent: 'from-fuchsia-400 to-brand-400',
    skills: ['Models', 'Evaluation', 'LLMs', 'MLOps', 'Stats'],
    order: 5,
  },
  {
    slug: 'behavioral',
    label: 'Behavioral & Leadership',
    shortLabel: 'Behavioral',
    blurb: 'Tell crisp stories with structure (SAR/STAR). Show ownership, judgment, and the ability to operate in ambiguity.',
    tagline: 'Tell sharp, structured stories.',
    iconKey: 'Users',
    accent: 'from-emerald-400 to-cyan-400',
    skills: ['Story', 'Ownership', 'Leadership', 'Conflict', 'Impact'],
    order: 6,
  },
];

// Each question is `[domainSlug, topic, difficulty, question, timeLimit]`.
// Kept compact for diff-friendliness; expand with the seed script.
export const QUESTIONS = [
  // ── DSA ─────────────────────────────────────────────────────────
  ['dsa', 'Arrays',     'Easy',   'Walk me through how you would find the longest run of consecutive equal numbers in an array. What is the time and space complexity, and how would it change if the array were a stream?', 120],
  ['dsa', 'Hashing',    'Easy',   'Explain how a hash map provides amortized O(1) lookups. What is amortized analysis, and when does that O(1) guarantee break down in practice?', 120],
  ['dsa', 'Strings',    'Easy',   'Describe two ways to check whether two strings are anagrams. Compare their time, space, and how each behaves on Unicode input.', 90],
  ['dsa', 'Linked List', 'Easy',  'How would you detect a cycle in a linked list? Explain Floyd\'s algorithm and prove informally why the two pointers must meet.', 120],
  ['dsa', 'Trees',      'Medium', 'Walk me through how you would serialize and deserialize a binary tree. Discuss DFS vs BFS approaches and how you would handle null markers.', 150],
  ['dsa', 'Graphs',     'Medium', 'Compare BFS and DFS for finding the shortest path on an unweighted graph. When would you prefer one over the other, and what changes when edges have weights?', 150],
  ['dsa', 'DP',         'Medium', 'Explain how to recognize when a problem is solvable by dynamic programming. Walk me through the state, transition, and base case for the longest increasing subsequence.', 180],
  ['dsa', 'Heaps',      'Medium', 'Describe how you would maintain the running median of a stream of numbers. What data structures do you need, and what is the cost per insert?', 150],
  ['dsa', 'Graphs',     'Hard',   'Walk me through Dijkstra\'s algorithm. Why does it not work on graphs with negative edges, and what would you use instead?', 180],
  ['dsa', 'DP',         'Hard',   'Explain how you would solve the edit distance problem. Describe the recurrence, the table, and how you would reduce the space from O(mn) to O(min(m,n)).', 210],
  ['dsa', 'Trees',      'Hard',   'How would you find the lowest common ancestor of two nodes in a binary tree without parent pointers? Walk through your recursive intuition and the complexity.', 180],
  ['dsa', 'Concurrency', 'Hard',  'You\'re given a thread-safe bounded queue interface. Walk me through how you would implement it from scratch — what primitives you would use and where the subtle bugs hide.', 210],

  // ── System Design ───────────────────────────────────────────────
  ['system-design', 'Fundamentals', 'Easy',   'What is the difference between vertical and horizontal scaling? When do you reach the limits of vertical scaling, and what new problems appear when you go horizontal?', 150],
  ['system-design', 'Storage',      'Easy',   'Explain the difference between SQL and NoSQL stores. When would you reach for a document store, a key-value store, or a wide-column store?', 150],
  ['system-design', 'Caching',      'Easy',   'Walk me through the role of a cache in a high-traffic system. Compare cache-aside, write-through, and write-back, and discuss invalidation strategies.', 150],
  ['system-design', 'APIs',         'Medium', 'Design a URL shortener like bit.ly. Talk through capacity estimation, the storage schema, ID generation, and how you handle very hot links.', 240],
  ['system-design', 'Feeds',        'Medium', 'Design the timeline / news feed for a social network. Compare fan-out on write vs fan-out on read, and explain where you would land for a Twitter-like product.', 240],
  ['system-design', 'Search',       'Medium', 'Walk me through the design of a typeahead / autocomplete service. What data structures back it, and how do you keep results personalized and fresh?', 240],
  ['system-design', 'Real-time',    'Medium', 'Design a chat application that supports 1:1 and group chat with message receipts. Talk through delivery guarantees, presence, and storage.', 240],
  ['system-design', 'Streaming',    'Hard',   'Design a video streaming service like YouTube. Cover ingestion, encoding pipeline, CDN strategy, recommendations, and the storage layer.', 300],
  ['system-design', 'Reliability',  'Hard',   'Design a distributed rate limiter that operates across many service instances. Compare token bucket, leaky bucket, and sliding-window approaches and where they fail.', 240],
  ['system-design', 'Consistency',  'Hard',   'Explain the CAP theorem in your own words. Pick a concrete system you have worked on and explain where it sits on the CP / AP spectrum and why.', 180],

  // ── Frontend ────────────────────────────────────────────────────
  ['frontend', 'React',         'Easy',   'Explain the difference between props and state in React. What happens when a parent re-renders, and how would you keep an expensive child from re-rendering?', 120],
  ['frontend', 'JavaScript',    'Easy',   'Walk me through the event loop. Explain how microtasks (Promises) and macrotasks (setTimeout) interleave, with an example.', 150],
  ['frontend', 'CSS',           'Easy',   'When would you reach for Flexbox vs Grid? Give a concrete layout example where each is the correct choice and explain why.', 90],
  ['frontend', 'Browser',       'Easy',   'Walk me through what happens between a user pressing Enter in the URL bar and seeing the first pixels of a website. Touch on DNS, TCP, HTTP, parsing, and rendering.', 180],
  ['frontend', 'React',         'Medium', 'Explain the difference between useMemo, useCallback, and React.memo. When does each one actually help, and when does it just add noise?', 150],
  ['frontend', 'State',         'Medium', 'Compare client state, server state, and URL state in a modern React app. Where would you place each, and what tooling do you prefer for them?', 150],
  ['frontend', 'Performance',   'Medium', 'You ship a React app and Core Web Vitals fail on LCP and INP in the field. Walk me through how you would investigate and the levers you would pull.', 210],
  ['frontend', 'Accessibility', 'Medium', 'How would you make a custom dropdown / combobox accessible? Talk through ARIA roles, keyboard interaction, and focus management.', 180],
  ['frontend', 'Architecture',  'Hard',   'Design a design system component library to be consumed by many product teams. How do you handle theming, slot composition, versioning, and accessibility guarantees?', 240],
  ['frontend', 'Rendering',     'Hard',   'Compare CSR, SSR, SSG, and streaming SSR. For a content-heavy authenticated dashboard, which would you pick and why?', 210],

  // ── Backend ─────────────────────────────────────────────────────
  ['backend', 'APIs',         'Easy',   'Compare REST and GraphQL. What do you give up by adopting GraphQL, and when is the trade-off worth it?', 150],
  ['backend', 'Databases',    'Easy',   'Explain database indexes. Walk through how a B-tree index makes a query fast and what the cost is on writes.', 150],
  ['backend', 'Auth',         'Easy',   'Compare session-based authentication and JWT-based authentication. What are the failure modes of each in a real system?', 150],
  ['backend', 'Concurrency',  'Easy',   'Explain the difference between concurrency and parallelism. Give an example where you would design for one but not the other.', 120],
  ['backend', 'Databases',    'Medium', 'Walk me through ACID and the four standard isolation levels. Pick one anomaly each level allows and explain it with a concrete example.', 210],
  ['backend', 'Reliability',  'Medium', 'Your service calls a flaky downstream API. Walk me through how you would design retries, timeouts, and a circuit breaker. What are the failure modes of retries themselves?', 180],
  ['backend', 'Messaging',    'Medium', 'Compare a message queue (e.g., SQS, RabbitMQ) and a log-based broker (e.g., Kafka). When would you reach for each, and what do you give up?', 180],
  ['backend', 'Scalability',  'Medium', 'You see latency spike at P99 for a single endpoint while P50 stays flat. Walk me through how you would investigate and the likely causes.', 210],
  ['backend', 'Distributed',  'Hard',   'Explain idempotency in distributed systems. How would you design a payments API such that retries are safe, end to end?', 240],
  ['backend', 'Data',         'Hard',   'Design a schema and ingestion pipeline for time-series metrics at high cardinality. Talk through storage, downsampling, and query patterns.', 240],

  // ── Machine Learning ────────────────────────────────────────────
  ['ml', 'Fundamentals', 'Easy',   'Explain the bias-variance trade-off. Give a concrete example of a model that is under-fitting vs over-fitting and what you would do about it.', 180],
  ['ml', 'Evaluation',   'Easy',   'When is accuracy a bad metric for classification? Walk through precision, recall, F1, and ROC-AUC, and when each is the right choice.', 180],
  ['ml', 'Training',     'Easy',   'Explain gradient descent in your own words. What are the differences between batch, mini-batch, and stochastic gradient descent in practice?', 150],
  ['ml', 'NLP',          'Easy',   'What is a word embedding? Compare classic embeddings (word2vec) to contextual embeddings from transformers.', 150],
  ['ml', 'LLMs',         'Medium', 'Explain how the transformer attention mechanism works at a high level. Why was attention such a leap over RNNs for long sequences?', 210],
  ['ml', 'LLMs',         'Medium', 'Compare prompt engineering, retrieval-augmented generation, and fine-tuning. For a customer-support assistant, walk through how you would decide between them.', 210],
  ['ml', 'MLOps',        'Medium', 'How would you detect and react to data drift and concept drift in a model running in production?', 180],
  ['ml', 'Systems',      'Medium', 'Design an end-to-end recommendation system for a streaming app. Cover candidate generation, ranking, training data, and online evaluation.', 240],
  ['ml', 'LLMs',         'Hard',   'You\'re deploying an LLM-powered feature. Walk me through how you would evaluate quality, control hallucinations, and observe regressions over time.', 240],
  ['ml', 'Statistics',   'Hard',   'Walk me through how you would design an A/B test for a ranking model change. How do you handle network effects and interleaved experiments?', 210],

  // ── Behavioral ──────────────────────────────────────────────────
  ['behavioral', 'Intro',      'Easy',   'Tell me about yourself. Walk me through your background, what you optimize for in engineering work, and why you\'re looking now.', 120],
  ['behavioral', 'Project',    'Easy',   'Walk me through the most technically interesting project you have shipped. Why was it hard, and what is the single thing you are most proud of?', 180],
  ['behavioral', 'Failure',    'Easy',   'Tell me about a time you shipped a bug to production. How did you respond in the moment, and what did you change afterwards?', 150],
  ['behavioral', 'Conflict',   'Easy',   'Describe a time you disagreed with a teammate on a technical decision. How did you resolve it, and what did you take from it?', 150],
  ['behavioral', 'Ownership',  'Medium', 'Tell me about a time you noticed something was broken that wasn\'t formally your responsibility. What did you do, and how did it land?', 180],
  ['behavioral', 'Ambiguity',  'Medium', 'Describe a project where the goal was unclear at the start. How did you create structure, get aligned, and decide what to build first?', 180],
  ['behavioral', 'Leadership', 'Medium', 'Tell me about a time you brought a struggling project back on track. What did you actually change about how the team worked?', 210],
  ['behavioral', 'Trade-offs', 'Medium', 'Walk me through a tough engineering trade-off you have made — speed vs quality, scope vs schedule, or build vs buy. How did you make the call?', 180],
  ['behavioral', 'Influence',  'Hard',   'Describe a time you changed your mind on something significant based on someone else\'s argument. Walk through the original position, the conversation, and the outcome.', 210],
  ['behavioral', 'Scale',      'Hard',   'Tell me about a system you owned that grew faster than expected. What broke, what did you re-architect, and what would you do differently with that hindsight?', 240],
];
