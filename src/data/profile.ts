// Everything on the site comes from this file (sourced from the CV).
// Update it here and every window, the terminal and the boot screen follow.

export const ACCENT = {
  blue: "#5e9cf5",
  purple: "#a78bfa",
  green: "#34d399",
  orange: "#fb923c",
  pink: "#f472b6",
} as const;

export const profile = {
  name: "Ruslan Voshchylo",
  firstName: "Ruslan",
  initials: "RV",
  handle: "rvoshchylo",
  role: "Full-Stack Developer",
  tagline: "Backend-leaning full-stack · NestJS · PostgreSQL · AWS · React",
  location: "Ternopil, Ukraine",
  remote: true,
  timezone: "Europe/Kyiv",
  available: true,
  resumeFile: "Ruslan_Voshchylo_CV.pdf",
  bio: {
    comment: "# backend-leaning full-stack developer. payments, billing, integrations.",
    // Rendered with highlights in about.exe; keep plain text in sync for the terminal.
    plain:
      "I build payment flows, subscription billing and integrations for production platforms " +
      "with NestJS, PostgreSQL, AWS, Terraform and React/TypeScript. I shipped Stripe billing " +
      "with idempotent webhooks, a state-machine payment service and a PCI DSS-compliant " +
      "insurance module for a DKK 280M+ car marketplace, and I ship OpenAI-powered features too. " +
      "English B2, completing an MSc in Cybersecurity.",
  },
  stats: [
    { k: "Experience", v: "2+ years, full-stack", c: ACCENT.blue },
    { k: "Deals on flows I built", v: "DKK 280M+", c: ACCENT.purple },
    { k: "Focus", v: "NestJS · Postgres · AWS", c: ACCENT.green },
    { k: "Currently", v: "MSc Cybersecurity", c: ACCENT.orange },
  ],
};

export type Contact = {
  id: string;
  label: string;
  handle: string;
  href: string;
  glyph: string;
  accent: string;
};

export const contacts: Contact[] = [
  {
    id: "email",
    label: "email",
    handle: "ruslan.voshchylo2@gmail.com",
    href: "mailto:ruslan.voshchylo2@gmail.com",
    glyph: "@",
    accent: ACCENT.blue,
  },
  {
    id: "github",
    label: "github",
    handle: "@rvoshchylo",
    href: "https://github.com/rvoshchylo",
    glyph: "</>",
    accent: ACCENT.purple,
  },
  {
    id: "linkedin",
    label: "linkedin",
    handle: "/in/ruslan-voshchylo",
    href: "https://www.linkedin.com/in/ruslan-voshchylo-5060522a9/",
    glyph: "in",
    accent: ACCENT.green,
  },
  {
    id: "telegram",
    label: "telegram",
    handle: "@rvoshchylo",
    href: "https://t.me/rvoshchylo",
    glyph: "➤",
    accent: ACCENT.orange,
  },
];

export const EMAIL = contacts[0].handle;

export type Project = {
  id: string;
  name: string;
  year: string;
  company: string;
  accent: string;
  summary: string;
  context: string;
  metrics: string[];
  highlights: string[];
  stack: string[];
};

export const projects: Project[] = [
  {
    id: "aksel",
    name: "aksel",
    year: "2025 —",
    company: "SoftKit",
    accent: ACCENT.orange,
    summary:
      "Payments, billing and insurance for a Danish used-car marketplace: 1,700+ cars and DKK 280M+ transacted in its second year.",
    context: "Danish private used-car marketplace (1,700+ cars, DKK 280M+ transacted in its second year)",
    metrics: ["DKK 280M+ in deals", "−30% stuck payments", "−40% API time"],
    highlights: [
      "Rebuilt the core vehicle sales flow behind DKK 280M+ in deals: Safepay v2 migration and a state-machine payment service with 3 payment modes and a zero-downtime v1→v2 rollout. Stuck or failed payments dropped by ~30%.",
      "Launched a new revenue line from scratch: a PCI DSS-compliant car insurance module, attached to ~15% of sales.",
      "Built Stripe billing (subscriptions, promo codes, refunds, idempotent webhooks), which automated ~80% of manual invoicing.",
      "Connected 7 external services (Pipedrive, Twilio, Spamhaus, IPQS, Slack, Stripe, Safepay) and moved ownership monitoring, debt checks and auto-delisting into background jobs. API response times dropped by ~40%.",
      "Added Vitest unit tests to CI/CD and upgraded Node.js 20→24 with Terraform, closing 20+ known CVEs.",
    ],
    stack: ["NestJS", "Stripe", "Safepay", "Terraform", "React"],
  },
  {
    id: "gogeta",
    name: "gogeta",
    year: "2025 —",
    company: "SoftKit",
    accent: ACCENT.blue,
    summary:
      "UK employee-benefits platform (B Corp, ISO 27001). Employees save up to 40% on bikes and 35% on nursery fees through salary sacrifice.",
    context:
      "UK employee-benefits platform (B Corp, ISO 27001); employees save up to 40% on bikes and up to 35% on nursery fees via salary sacrifice",
    metrics: ["~5 h/week ops saved", "+15% inbox placement", "−90% dup. tickets"],
    highlights: [
      "Automated funding-deadline enforcement: an SQS-driven job pauses applications when allocations close, keeps an auditable pause history and notifies admins and parents. Saves the ops team ~5 hours/week of manual checks.",
      "Audited and fixed all 63 Mailgun transactional templates (removed tracking links and pixels, moved to one sender domain), which lifted inbox placement by ~15%. Email normalization cut duplicate-account support tickets by ~90%.",
      "Shipped filtered background CSV exports that handle 10k+ records without UI timeouts. Moved the Bike portal to design-system tokens with shared MFA components.",
    ],
    stack: ["NestJS", "TypeORM", "PostgreSQL", "AWS SQS", "React", "TypeScript"],
  },
  {
    id: "teach-aid",
    name: "teach-aid",
    year: "2024",
    company: "VISO",
    accent: ACCENT.green,
    summary:
      "AI collaboration platform for teachers and students. OpenAI-generated assignments cut prep time from ~30 min to under 5.",
    context: "AI collaboration platform for teachers and students",
    metrics: ["30 → <5 min prep", "RBAC", "multi-school"],
    highlights: [
      "OpenAI-based assignment generation with structured output parsing and fallbacks, which cut assignment prep from ~30 min to under 5.",
      "NestJS auth with JWT, refresh tokens and Google OAuth.",
      "RBAC and multi-school/class management on Prisma + PostgreSQL.",
    ],
    stack: ["NestJS", "OpenAI API", "Prisma", "PostgreSQL", "JWT", "OAuth"],
  },
  {
    id: "tripami",
    name: "tripami",
    year: "2024",
    company: "VISO",
    accent: ACCENT.purple,
    summary:
      "Travel journaling and community platform: a responsive web app with auth, photo/video uploads, recommendations and social features.",
    context: "Travel journaling & community platform",
    metrics: ["responsive web", "media pipeline", "social"],
    highlights: [
      "Responsive web app with authentication.",
      "Photo/video upload pipeline.",
      "Recommendations and social features for the travel community.",
    ],
    stack: ["auth", "media uploads", "recommendations", "social"],
  },
];

export type Job = {
  company: string;
  href?: string;
  role: string;
  period: string;
  place: string;
  current?: boolean;
  accent: string;
  projects: string[]; // project ids
  note: string;
};

export const jobs: Job[] = [
  {
    company: "SoftKit",
    href: "https://www.softkit.dev/",
    role: "Full-Stack Developer",
    period: "07/2025 — present",
    place: "remote",
    current: true,
    accent: ACCENT.blue,
    projects: ["aksel", "gogeta"],
    note: "Payments, billing, background jobs and integrations on NestJS + AWS for two production platforms.",
  },
  {
    company: "VISO",
    role: "Full-Stack Developer",
    period: "2024 — 2025",
    place: "Lviv, Ukraine",
    accent: ACCENT.purple,
    projects: ["teach-aid", "tripami"],
    note: "Full-stack product work: OpenAI-powered features, auth, RBAC and media pipelines.",
  },
];

export type Study = {
  degree: string;
  school: string;
  href?: string;
  period: string;
  current?: boolean;
};

export const education: Study[] = [
  {
    degree: "Master's Degree in Cybersecurity",
    school: "Ternopil Ivan Puluj National Technical University",
    period: "09/2024 — present",
    current: true,
  },
  {
    degree: "Bachelor's Degree in Cybersecurity",
    school: "Ternopil Ivan Puluj National Technical University",
    period: "09/2022 — 07/2024",
  },
  {
    degree: "Junior Specialist, Computer Engineering",
    school: "Technical College of Ternopil Ivan Puluj National Technical University",
    href: "https://tk.te.ua/",
    period: "09/2015 — 07/2020",
  },
];

export type SkillCategory = { name: string; accent: string; skills: string[] };

export const skills: SkillCategory[] = [
  {
    name: "Backend",
    accent: ACCENT.purple,
    skills: ["NestJS", "Node.js", "TypeORM", "Prisma", "PostgreSQL", "REST APIs", "OpenAPI/Swagger", "Passport.js", "JWT"],
  },
  {
    name: "Frontend",
    accent: ACCENT.blue,
    skills: [
      "React", "TypeScript", "Zustand", "React Hook Form", "Zod", "Tailwind CSS", "MUI", "Ant Design",
      "Styled Components", "React Router", "TanStack Query", "Vite", "Recharts", "dnd-kit",
    ],
  },
  {
    name: "Cloud & DevOps",
    accent: ACCENT.green,
    skills: ["AWS SQS", "AWS Lambda", "Terraform", "Docker", "GitHub Actions", "CI/CD", "Sentry"],
  },
  {
    name: "Integrations",
    accent: ACCENT.orange,
    skills: ["Stripe", "Safepay", "OpenAI API", "Pipedrive CRM", "Twilio", "SendGrid", "Mailgun", "Slack API", "Uppy/S3"],
  },
  {
    name: "Testing & Tooling",
    accent: ACCENT.pink,
    skills: ["Jest", "Vitest", "Git", "Nx monorepo", "Claude Code"],
  },
];

export const resumeUrl = () => `${import.meta.env.BASE_URL}${profile.resumeFile}`;
