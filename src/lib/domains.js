/**
 * CS-focused interview domains and question banks for InterPrep.
 * Each question has a stable id of the form `${domainId}-${index}` so
 * sessions can reference them reliably across rebuilds.
 *
 * `timeLimit` is suggested answer length in seconds.
 */

export const DOMAINS = [
  {
    id: 'dsa',
    label: 'Data Structures & Algorithms',
    shortLabel: 'DSA',
    blurb:
      'Whiteboard-style algorithmic reasoning. Talk through approach, complexity, and edge cases — not syntax.',
    tagline: 'Reason out loud about complexity.',
    iconKey: 'Binary',
    accent: 'from-brand-400 to-cyan-400',
    skills: ['Arrays', 'Trees', 'Graphs', 'DP', 'Complexity'],
  },
  {
    id: 'system-design',
    label: 'System Design',
    shortLabel: 'System Design',
    blurb:
      'High-level design of scalable systems. Capacity estimation, trade-offs, data modeling, partitioning, and availability.',
    tagline: 'Design for scale and trade-offs.',
    iconKey: 'Network',
    accent: 'from-violet-400 to-fuchsia-400',
    skills: ['Capacity', 'Sharding', 'Caching', 'CAP', 'Trade-offs'],
  },
  {
    id: 'frontend',
    label: 'Frontend Engineering',
    shortLabel: 'Frontend',
    blurb:
      'React, JavaScript, browser internals, performance, and accessibility. Architecture-level reasoning, not trivia.',
    tagline: 'Architect on top of the browser.',
    iconKey: 'LayoutTemplate',
    accent: 'from-cyan-400 to-emerald-400',
    skills: ['React', 'JS', 'Perf', 'A11y', 'CSS'],
  },
  {
    id: 'backend',
    label: 'Backend Engineering',
    shortLabel: 'Backend',
    blurb:
      'APIs, databases, concurrency, observability, and reliability. Practical decisions you have to defend.',
    tagline: 'Defend the decisions on the API side.',
    iconKey: 'Server',
    accent: 'from-amber-400 to-rose-400',
    skills: ['APIs', 'SQL', 'Caching', 'Concurrency', 'Reliability'],
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    shortLabel: 'ML / AI',
    blurb:
      'Modeling, evaluation, training pipelines, LLMs in production, and ML system design. Conceptual depth over jargon.',
    tagline: 'From data to deployed model.',
    iconKey: 'Brain',
    accent: 'from-fuchsia-400 to-brand-400',
    skills: ['Models', 'Evaluation', 'LLMs', 'MLOps', 'Stats'],
  },
  {
    id: 'behavioral',
    label: 'Behavioral & Leadership',
    shortLabel: 'Behavioral',
    blurb:
      'Tell crisp stories with structure (SAR/STAR). Show ownership, judgment, and the ability to operate in ambiguity.',
    tagline: 'Tell sharp, structured stories.',
    iconKey: 'Users',
    accent: 'from-emerald-400 to-cyan-400',
    skills: ['Story', 'Ownership', 'Leadership', 'Conflict', 'Impact'],
  },
];

export const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Warm-up',
    desc: 'Fundamentals and core concepts. Good for first-time runs in a domain.',
  },
  {
    id: 'medium',
    label: 'Standard',
    desc: 'A realistic mix of conceptual depth and applied reasoning — the bulk of real interviews.',
  },
  {
    id: 'hard',
    label: 'Senior',
    desc: 'Trade-off heavy, ambiguous, and open-ended. Where staff/senior interviews live.',
  },
];

/* ─── Question banks per domain ──────────────────────────────────── */

const dsaQuestions = [
  { topic: 'Arrays',     difficulty: 'Easy',   question: 'Walk me through how you would find the longest run of consecutive equal numbers in an array. What is the time and space complexity, and how would it change if the array were a stream?', timeLimit: 120 },
  { topic: 'Hashing',    difficulty: 'Easy',   question: 'Explain how a hash map provides amortized O(1) lookups. What is amortized analysis, and when does that O(1) guarantee break down in practice?', timeLimit: 120 },
  { topic: 'Strings',    difficulty: 'Easy',   question: 'Describe two ways to check whether two strings are anagrams. Compare their time, space, and how each behaves on Unicode input.', timeLimit: 90  },
  { topic: 'Linked List', difficulty: 'Easy',  question: 'How would you detect a cycle in a linked list? Explain Floyd\'s algorithm and prove informally why the two pointers must meet.', timeLimit: 120 },
  { topic: 'Trees',      difficulty: 'Medium', question: 'Walk me through how you would serialize and deserialize a binary tree. Discuss DFS vs BFS approaches and how you would handle null markers.', timeLimit: 150 },
  { topic: 'Graphs',     difficulty: 'Medium', question: 'Compare BFS and DFS for finding the shortest path on an unweighted graph. When would you prefer one over the other, and what changes when edges have weights?', timeLimit: 150 },
  { topic: 'DP',         difficulty: 'Medium', question: 'Explain how to recognize when a problem is solvable by dynamic programming. Walk me through the state, transition, and base case for the longest increasing subsequence.', timeLimit: 180 },
  { topic: 'Heaps',      difficulty: 'Medium', question: 'Describe how you would maintain the running median of a stream of numbers. What data structures do you need, and what is the cost per insert?', timeLimit: 150 },
  { topic: 'Graphs',     difficulty: 'Hard',   question: 'Walk me through Dijkstra\'s algorithm. Why does it not work on graphs with negative edges, and what would you use instead?', timeLimit: 180 },
  { topic: 'DP',         difficulty: 'Hard',   question: 'Explain how you would solve the edit distance problem. Describe the recurrence, the table, and how you would reduce the space from O(mn) to O(min(m,n)).', timeLimit: 210 },
  { topic: 'Trees',      difficulty: 'Hard',   question: 'How would you find the lowest common ancestor of two nodes in a binary tree without parent pointers? Walk through your recursive intuition and the complexity.', timeLimit: 180 },
  { topic: 'Concurrency', difficulty: 'Hard',  question: 'You\'re given a thread-safe bounded queue interface. Walk me through how you would implement it from scratch — what primitives you would use and where the subtle bugs hide.', timeLimit: 210 },
];

const systemDesignQuestions = [
  { topic: 'Fundamentals', difficulty: 'Easy',   question: 'What is the difference between vertical and horizontal scaling? When do you reach the limits of vertical scaling, and what new problems appear when you go horizontal?', timeLimit: 150 },
  { topic: 'Storage',      difficulty: 'Easy',   question: 'Explain the difference between SQL and NoSQL stores. When would you reach for a document store, a key-value store, or a wide-column store?', timeLimit: 150 },
  { topic: 'Caching',      difficulty: 'Easy',   question: 'Walk me through the role of a cache in a high-traffic system. Compare cache-aside, write-through, and write-back, and discuss invalidation strategies.', timeLimit: 150 },
  { topic: 'APIs',         difficulty: 'Medium', question: 'Design a URL shortener like bit.ly. Talk through capacity estimation, the storage schema, ID generation, and how you handle very hot links.', timeLimit: 240 },
  { topic: 'Feeds',        difficulty: 'Medium', question: 'Design the timeline / news feed for a social network. Compare fan-out on write vs fan-out on read, and explain where you would land for a Twitter-like product.', timeLimit: 240 },
  { topic: 'Search',       difficulty: 'Medium', question: 'Walk me through the design of a typeahead / autocomplete service. What data structures back it, and how do you keep results personalized and fresh?', timeLimit: 240 },
  { topic: 'Real-time',    difficulty: 'Medium', question: 'Design a chat application that supports 1:1 and group chat with message receipts. Talk through delivery guarantees, presence, and storage.', timeLimit: 240 },
  { topic: 'Streaming',    difficulty: 'Hard',   question: 'Design a video streaming service like YouTube. Cover ingestion, encoding pipeline, CDN strategy, recommendations, and the storage layer.', timeLimit: 300 },
  { topic: 'Reliability',  difficulty: 'Hard',   question: 'Design a distributed rate limiter that operates across many service instances. Compare token bucket, leaky bucket, and sliding-window approaches and where they fail.', timeLimit: 240 },
  { topic: 'Consistency',  difficulty: 'Hard',   question: 'Explain the CAP theorem in your own words. Pick a concrete system you have worked on and explain where it sits on the CP / AP spectrum and why.', timeLimit: 180 },
];

const frontendQuestions = [
  { topic: 'React',     difficulty: 'Easy',   question: 'Explain the difference between props and state in React. What happens when a parent re-renders, and how would you keep an expensive child from re-rendering?', timeLimit: 120 },
  { topic: 'JavaScript', difficulty: 'Easy',  question: 'Walk me through the event loop. Explain how microtasks (Promises) and macrotasks (setTimeout) interleave, with an example.', timeLimit: 150 },
  { topic: 'CSS',       difficulty: 'Easy',   question: 'When would you reach for Flexbox vs Grid? Give a concrete layout example where each is the correct choice and explain why.', timeLimit: 90  },
  { topic: 'Browser',   difficulty: 'Easy',   question: 'Walk me through what happens between a user pressing Enter in the URL bar and seeing the first pixels of a website. Touch on DNS, TCP, HTTP, parsing, and rendering.', timeLimit: 180 },
  { topic: 'React',     difficulty: 'Medium', question: 'Explain the difference between useMemo, useCallback, and React.memo. When does each one actually help, and when does it just add noise?', timeLimit: 150 },
  { topic: 'State',     difficulty: 'Medium', question: 'Compare client state, server state, and URL state in a modern React app. Where would you place each, and what tooling do you prefer for them?', timeLimit: 150 },
  { topic: 'Performance', difficulty: 'Medium', question: 'You ship a React app and Core Web Vitals fail on LCP and INP in the field. Walk me through how you would investigate and the levers you would pull.', timeLimit: 210 },
  { topic: 'Accessibility', difficulty: 'Medium', question: 'How would you make a custom dropdown / combobox accessible? Talk through ARIA roles, keyboard interaction, and focus management.', timeLimit: 180 },
  { topic: 'Architecture', difficulty: 'Hard', question: 'Design a design system component library to be consumed by many product teams. How do you handle theming, slot composition, versioning, and accessibility guarantees?', timeLimit: 240 },
  { topic: 'Rendering', difficulty: 'Hard', question: 'Compare CSR, SSR, SSG, and streaming SSR. For a content-heavy authenticated dashboard, which would you pick and why?', timeLimit: 210 },
];

const backendQuestions = [
  { topic: 'APIs',          difficulty: 'Easy',   question: 'Compare REST and GraphQL. What do you give up by adopting GraphQL, and when is the trade-off worth it?', timeLimit: 150 },
  { topic: 'Databases',     difficulty: 'Easy',   question: 'Explain database indexes. Walk through how a B-tree index makes a query fast and what the cost is on writes.', timeLimit: 150 },
  { topic: 'Auth',          difficulty: 'Easy',   question: 'Compare session-based authentication and JWT-based authentication. What are the failure modes of each in a real system?', timeLimit: 150 },
  { topic: 'Concurrency',   difficulty: 'Easy',   question: 'Explain the difference between concurrency and parallelism. Give an example where you would design for one but not the other.', timeLimit: 120 },
  { topic: 'Databases',     difficulty: 'Medium', question: 'Walk me through ACID and the four standard isolation levels. Pick one anomaly each level allows and explain it with a concrete example.', timeLimit: 210 },
  { topic: 'Reliability',   difficulty: 'Medium', question: 'Your service calls a flaky downstream API. Walk me through how you would design retries, timeouts, and a circuit breaker. What are the failure modes of retries themselves?', timeLimit: 180 },
  { topic: 'Messaging',     difficulty: 'Medium', question: 'Compare a message queue (e.g., SQS, RabbitMQ) and a log-based broker (e.g., Kafka). When would you reach for each, and what do you give up?', timeLimit: 180 },
  { topic: 'Scalability',   difficulty: 'Medium', question: 'You see latency spike at P99 for a single endpoint while P50 stays flat. Walk me through how you would investigate and the likely causes.', timeLimit: 210 },
  { topic: 'Distributed',   difficulty: 'Hard',   question: 'Explain idempotency in distributed systems. How would you design a payments API such that retries are safe, end to end?', timeLimit: 240 },
  { topic: 'Data',          difficulty: 'Hard',   question: 'Design a schema and ingestion pipeline for time-series metrics at high cardinality. Talk through storage, downsampling, and query patterns.', timeLimit: 240 },
];

const mlQuestions = [
  { topic: 'Fundamentals', difficulty: 'Easy',   question: 'Explain the bias-variance trade-off. Give a concrete example of a model that is under-fitting vs over-fitting and what you would do about it.', timeLimit: 180 },
  { topic: 'Evaluation',   difficulty: 'Easy',   question: 'When is accuracy a bad metric for classification? Walk through precision, recall, F1, and ROC-AUC, and when each is the right choice.', timeLimit: 180 },
  { topic: 'Training',     difficulty: 'Easy',   question: 'Explain gradient descent in your own words. What are the differences between batch, mini-batch, and stochastic gradient descent in practice?', timeLimit: 150 },
  { topic: 'NLP',          difficulty: 'Easy',   question: 'What is a word embedding? Compare classic embeddings (word2vec) to contextual embeddings from transformers.', timeLimit: 150 },
  { topic: 'LLMs',         difficulty: 'Medium', question: 'Explain how the transformer attention mechanism works at a high level. Why was attention such a leap over RNNs for long sequences?', timeLimit: 210 },
  { topic: 'LLMs',         difficulty: 'Medium', question: 'Compare prompt engineering, retrieval-augmented generation, and fine-tuning. For a customer-support assistant, walk through how you would decide between them.', timeLimit: 210 },
  { topic: 'MLOps',        difficulty: 'Medium', question: 'How would you detect and react to data drift and concept drift in a model running in production?', timeLimit: 180 },
  { topic: 'Systems',      difficulty: 'Medium', question: 'Design an end-to-end recommendation system for a streaming app. Cover candidate generation, ranking, training data, and online evaluation.', timeLimit: 240 },
  { topic: 'LLMs',         difficulty: 'Hard',   question: 'You\'re deploying an LLM-powered feature. Walk me through how you would evaluate quality, control hallucinations, and observe regressions over time.', timeLimit: 240 },
  { topic: 'Statistics',   difficulty: 'Hard',   question: 'Walk me through how you would design an A/B test for a ranking model change. How do you handle network effects and interleaved experiments?', timeLimit: 210 },
];

const behavioralQuestions = [
  { topic: 'Intro',        difficulty: 'Easy',   question: 'Tell me about yourself. Walk me through your background, what you optimize for in engineering work, and why you\'re looking now.', timeLimit: 120 },
  { topic: 'Project',      difficulty: 'Easy',   question: 'Walk me through the most technically interesting project you have shipped. Why was it hard, and what is the single thing you are most proud of?', timeLimit: 180 },
  { topic: 'Failure',      difficulty: 'Easy',   question: 'Tell me about a time you shipped a bug to production. How did you respond in the moment, and what did you change afterwards?', timeLimit: 150 },
  { topic: 'Conflict',     difficulty: 'Easy',   question: 'Describe a time you disagreed with a teammate on a technical decision. How did you resolve it, and what did you take from it?', timeLimit: 150 },
  { topic: 'Ownership',    difficulty: 'Medium', question: 'Tell me about a time you noticed something was broken that wasn\'t formally your responsibility. What did you do, and how did it land?', timeLimit: 180 },
  { topic: 'Ambiguity',    difficulty: 'Medium', question: 'Describe a project where the goal was unclear at the start. How did you create structure, get aligned, and decide what to build first?', timeLimit: 180 },
  { topic: 'Leadership',   difficulty: 'Medium', question: 'Tell me about a time you brought a struggling project back on track. What did you actually change about how the team worked?', timeLimit: 210 },
  { topic: 'Trade-offs',   difficulty: 'Medium', question: 'Walk me through a tough engineering trade-off you have made — speed vs quality, scope vs schedule, or build vs buy. How did you make the call?', timeLimit: 180 },
  { topic: 'Influence',    difficulty: 'Hard',   question: 'Describe a time you changed your mind on something significant based on someone else\'s argument. Walk through the original position, the conversation, and the outcome.', timeLimit: 210 },
  { topic: 'Scale',        difficulty: 'Hard',   question: 'Tell me about a system you owned that grew faster than expected. What broke, what did you re-architect, and what would you do differently with that hindsight?', timeLimit: 240 },
];

const RAW = {
  'dsa':           dsaQuestions,
  'system-design': systemDesignQuestions,
  'frontend':      frontendQuestions,
  'backend':       backendQuestions,
  'ml':            mlQuestions,
  'behavioral':    behavioralQuestions,
};

// Attach stable ids and freeze.
export const QUESTIONS = Object.fromEntries(
  Object.entries(RAW).map(([domainId, list]) => [
    domainId,
    list.map((q, i) => ({
      ...q,
      id: `${domainId}-${i + 1}`,
      domainId,
    })),
  ]),
);

export function getDomain(id) {
  return DOMAINS.find((d) => d.id === id) || null;
}

/**
 * Resolve the live question list for a domain, applying any client-side
 * library overrides (added / edited / removed).
 */
export function getQuestions(domainId, libraryOverrides) {
  const base = QUESTIONS[domainId] || [];
  if (!libraryOverrides) return base;

  const removed = new Set(libraryOverrides.removed || []);
  const edited = libraryOverrides.edited || {};
  const added = (libraryOverrides.added || []).filter((q) => q.domainId === domainId);

  return [
    ...base
      .filter((q) => !removed.has(q.id))
      .map((q) => ({ ...q, ...(edited[q.id] || {}) })),
    ...added,
  ];
}

/** Filter a question list by difficulty preset. */
export function filterByDifficulty(list, difficulty) {
  if (!difficulty || difficulty === 'all') return list;
  return list.filter((q) => q.difficulty.toLowerCase() === difficulty);
}
