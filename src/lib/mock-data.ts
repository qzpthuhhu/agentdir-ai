import { Agent, AgentTypeInfo, ArchitectureInfo, DomainInfo, EcosystemInfo, Category, Tag } from "@/types/agent";

export const agentTypes: AgentTypeInfo[] = [
  { slug: "coding", name: "Coding", description: "AI agents for software development" },
  { slug: "research", name: "Research", description: "Gather and synthesize information" },
  { slug: "browser", name: "Browser", description: "Web browsing and scraping agents" },
  { slug: "automation", name: "Automation", description: "Workflow and process automation" },
  { slug: "chat", name: "Chat", description: "Conversational AI interfaces" },
  { slug: "productivity", name: "Productivity", description: "Task and time management" },
  { slug: "data", name: "Data", description: "Data analysis and processing" },
  { slug: "devops", name: "DevOps", description: "Infrastructure and deployment" },
  { slug: "security", name: "Security", description: "Threat detection and response" },
  { slug: "creative", name: "Creative", description: "Content and design generation" },
  { slug: "customer-support", name: "Customer Support", description: "Automated customer service" },
  { slug: "assistant", name: "Assistant", description: "General-purpose AI assistants" },
];

export const architectures: ArchitectureInfo[] = [
  { slug: "autonomous", name: "Autonomous", description: "Self-directed task completion" },
  { slug: "multi-agent", name: "Multi-Agent", description: "Multiple agents collaborating" },
  { slug: "planning", name: "Planning", description: "Strategic task decomposition" },
  { slug: "tool-use", name: "Tool Use", description: "External tool integration" },
  { slug: "retrieval", name: "Retrieval", description: "RAG-based knowledge access" },
  { slug: "memory", name: "Memory", description: "Persistent context retention" },
  { slug: "reasoning", name: "Reasoning", description: "Chain-of-thought reasoning" },
  { slug: "workflow", name: "Workflow", description: "Structured process execution" },
  { slug: "simulation", name: "Simulation", description: "Environment simulation" },
  { slug: "embodied", name: "Embodied", description: "Physical world interaction" },
];

export const domains: DomainInfo[] = [
  { slug: "finance", name: "Finance", description: "Banking, trading, and fintech" },
  { slug: "healthcare", name: "Healthcare", description: "Medical and health applications" },
  { slug: "education", name: "Education", description: "Learning and training" },
  { slug: "legal", name: "Legal", description: "Law and compliance" },
  { slug: "marketing", name: "Marketing", description: "Marketing and advertising" },
  { slug: "sales", name: "Sales", description: "Sales and CRM" },
  { slug: "cybersecurity", name: "Cybersecurity", description: "Security operations" },
  { slug: "e-commerce", name: "E-commerce", description: "Online retail and commerce" },
  { slug: "gaming", name: "Gaming", description: "Game development and AI" },
  { slug: "scientific", name: "Scientific", description: "Research and discovery" },
  { slug: "robotics", name: "Robotics", description: "Robot control and planning" },
];

export const ecosystems: EcosystemInfo[] = [
  { slug: "open-source", name: "Open Source", description: "Community-driven projects on GitHub", agentCount: 45 },
  { slug: "startup", name: "Startups", description: "AI products built by startups", agentCount: 38 },
  { slug: "big-tech", name: "Big Tech", description: "Agents from major tech companies", agentCount: 28 },
  { slug: "china-ai", name: "China AI", description: "AI agents from Chinese tech giants", agentCount: 18 },
];

export const agents: Agent[] = [
  {
    id: "1", slug: "codex-ai", name: "Codex AI", tagline: "Your AI pair programmer",
    description: "Codex AI transforms how developers write code. It understands context, generates production-ready code, and helps debug complex issues in real-time.",
    category: "coding", agentType: "coding", architectures: ["autonomous", "tool-use", "reasoning"],
    domains: ["education"], ecosystem: "big-tech", provider: "OpenAI", country: "US",
    tags: ["coding", "productivity", "developer-tools"],
    pricing: "freemium", rating: 4.8, reviewCount: 2340, imageUrl: "",
    website: "https://example.com", features: ["Code generation", "Bug detection", "Refactoring suggestions", "Multi-language support"],
    useCases: ["Web development", "API design", "Code review"], createdAt: "2024-01-15",
    githubStars: 12400, language: "Python", license: "MIT", isOpenSource: false
  },
  {
    id: "2", slug: "content-forge", name: "Content Forge", tagline: "AI-powered content creation engine",
    description: "Content Forge generates high-quality blog posts, social media content, and marketing copy in seconds.",
    category: "creative", agentType: "creative", architectures: ["reasoning", "retrieval"],
    domains: ["marketing"], ecosystem: "startup", provider: "ContentForge Inc", country: "US",
    tags: ["writing", "marketing", "content"],
    pricing: "paid", rating: 4.5, reviewCount: 1820, imageUrl: "",
    website: "https://example.com", features: ["Blog writing", "Social media posts", "SEO optimization", "Brand voice matching"],
    useCases: ["Content marketing", "Social media management", "SEO"], createdAt: "2024-02-20",
    githubStars: 3200, language: "TypeScript", license: "Proprietary", isOpenSource: false
  },
  {
    id: "3", slug: "vision-lens", name: "Vision Lens", tagline: "See the world through AI eyes",
    description: "Vision Lens analyzes images and videos with state-of-the-art computer vision.",
    category: "data", agentType: "data", architectures: ["autonomous", "tool-use"],
    domains: ["healthcare", "scientific"], ecosystem: "big-tech", provider: "Google", country: "US",
    tags: ["image", "computer-vision", "analytics"],
    pricing: "enterprise", rating: 4.7, reviewCount: 980, imageUrl: "",
    website: "https://example.com", features: ["Object detection", "Scene analysis", "OCR", "Image generation"],
    useCases: ["Quality control", "Medical imaging", "Security"], createdAt: "2024-03-10",
    githubStars: 8900, language: "Python", license: "Apache-2.0", isOpenSource: true
  },
  {
    id: "4", slug: "data-whisperer", name: "Data Whisperer", tagline: "Turn raw data into insights",
    description: "Data Whisperer connects to your databases and automatically surfaces trends, anomalies, and actionable insights.",
    category: "data", agentType: "data", architectures: ["retrieval", "reasoning", "tool-use"],
    domains: ["finance", "e-commerce"], ecosystem: "startup", provider: "DataWhisper Labs", country: "US",
    tags: ["data", "analytics", "business-intelligence"],
    pricing: "freemium", rating: 4.6, reviewCount: 1560, imageUrl: "",
    website: "https://example.com", features: ["Natural language queries", "Auto-visualization", "Anomaly detection", "Report generation"],
    useCases: ["Business analytics", "Financial reporting", "Market research"], createdAt: "2024-01-28",
    githubStars: 5600, language: "Go", license: "MIT", isOpenSource: true
  },
  {
    id: "5", slug: "chat-symphony", name: "Chat Symphony", tagline: "Orchestrate perfect conversations",
    description: "Chat Symphony builds intelligent chatbots that understand context and handle complex multi-turn conversations.",
    category: "chat", agentType: "chat", architectures: ["memory", "multi-agent", "planning"],
    domains: ["e-commerce", "sales"], ecosystem: "startup", provider: "Symphony AI", country: "UK",
    tags: ["chatbot", "customer-support", "automation"],
    pricing: "paid", rating: 4.4, reviewCount: 2100, imageUrl: "",
    website: "https://example.com", features: ["Multi-turn dialogue", "Sentiment analysis", "Platform integration", "Custom training"],
    useCases: ["Customer support", "Sales automation", "Internal helpdesk"], createdAt: "2024-02-05",
    githubStars: 4100, language: "JavaScript", license: "Proprietary", isOpenSource: false
  },
  {
    id: "6", slug: "auto-flow", name: "AutoFlow", tagline: "Automate any workflow with AI",
    description: "AutoFlow watches how you work and suggests automations. Connect apps, trigger actions, and let AI handle the repetitive stuff.",
    category: "automation", agentType: "automation", architectures: ["workflow", "autonomous", "tool-use"],
    domains: ["e-commerce", "marketing"], ecosystem: "open-source", provider: "AutoFlow Community", country: "DE",
    tags: ["automation", "productivity", "workflow"],
    pricing: "free", rating: 4.3, reviewCount: 3200, imageUrl: "",
    website: "https://example.com", features: ["Workflow builder", "App integrations", "Smart triggers", "Error handling"],
    useCases: ["Process automation", "Data entry", "Email workflows"], createdAt: "2024-03-01",
    githubStars: 15800, language: "Rust", license: "MIT", isOpenSource: true
  },
  {
    id: "7", slug: "lingua-bridge", name: "Lingua Bridge", tagline: "Break every language barrier",
    description: "Lingua Bridge provides real-time translation across 100+ languages with context awareness.",
    category: "assistant", agentType: "assistant", architectures: ["reasoning", "memory", "retrieval"],
    domains: ["education"], ecosystem: "open-source", provider: "LinguaBridge Foundation", country: "FR",
    tags: ["translation", "language", "communication"],
    pricing: "freemium", rating: 4.9, reviewCount: 4500, imageUrl: "",
    website: "https://example.com", features: ["100+ languages", "Real-time translation", "Context-aware", "Document translation"],
    useCases: ["Global business", "Travel", "Content localization"], createdAt: "2024-01-10",
    githubStars: 22100, language: "Python", license: "Apache-2.0", isOpenSource: true
  },
  {
    id: "8", slug: "secure-sentinel", name: "Secure Sentinel", tagline: "AI-powered cybersecurity guardian",
    description: "Secure Sentinel monitors your infrastructure 24/7, detects threats in real-time, and automatically responds to security incidents.",
    category: "security", agentType: "security", architectures: ["autonomous", "planning", "tool-use"],
    domains: ["cybersecurity", "finance"], ecosystem: "big-tech", provider: "Microsoft", country: "US",
    tags: ["security", "monitoring", "enterprise"],
    pricing: "enterprise", rating: 4.8, reviewCount: 870, imageUrl: "",
    website: "https://example.com", features: ["Threat detection", "Incident response", "Compliance monitoring", "Vulnerability scanning"],
    useCases: ["Enterprise security", "Compliance", "Threat hunting"], createdAt: "2024-02-14",
    githubStars: 9700, language: "Go", license: "Proprietary", isOpenSource: false
  },
  {
    id: "9", slug: "qwen-agent", name: "Qwen Agent", tagline: "Alibaba's intelligent assistant framework",
    description: "Qwen Agent is an open-source agent framework built on top of Qwen LLMs, supporting tool use, planning, and multi-agent orchestration.",
    category: "assistant", agentType: "assistant", architectures: ["autonomous", "multi-agent", "tool-use", "planning"],
    domains: ["e-commerce", "finance"], ecosystem: "china-ai", provider: "Alibaba", country: "CN",
    tags: ["agent-framework", "llm", "open-source"],
    pricing: "free", rating: 4.6, reviewCount: 1200, imageUrl: "",
    website: "https://example.com", features: ["Tool calling", "Multi-agent", "Code interpreter", "Browser automation"],
    useCases: ["E-commerce automation", "Research", "Code generation"], createdAt: "2024-04-01",
    githubStars: 18500, language: "Python", license: "Apache-2.0", isOpenSource: true
  },
  {
    id: "10", slug: "coze-bot", name: "Coze", tagline: "ByteDance's AI bot building platform",
    description: "Coze enables anyone to build AI chatbots with plugins, workflows, and knowledge bases — no coding required.",
    category: "chat", agentType: "chat", architectures: ["workflow", "retrieval", "tool-use"],
    domains: ["marketing", "education"], ecosystem: "china-ai", provider: "ByteDance", country: "CN",
    tags: ["no-code", "chatbot", "plugins"],
    pricing: "freemium", rating: 4.3, reviewCount: 2800, imageUrl: "",
    website: "https://example.com", features: ["Plugin ecosystem", "Knowledge base", "Workflow builder", "Multi-platform deploy"],
    useCases: ["Customer service", "Education bots", "Marketing automation"], createdAt: "2024-03-15",
    githubStars: 6200, language: "TypeScript", license: "Proprietary", isOpenSource: false
  },
  {
    id: "11", slug: "browser-pilot", name: "BrowserPilot", tagline: "Autonomous web browsing agent",
    description: "BrowserPilot navigates the web autonomously, filling forms, extracting data, and completing tasks across websites.",
    category: "browser", agentType: "browser", architectures: ["autonomous", "planning", "tool-use"],
    domains: ["e-commerce", "marketing"], ecosystem: "open-source", provider: "BrowserPilot Community", country: "US",
    tags: ["browser", "web-scraping", "automation"],
    pricing: "free", rating: 4.5, reviewCount: 1900, imageUrl: "",
    website: "https://example.com", features: ["Visual navigation", "Form filling", "Data extraction", "Multi-tab support"],
    useCases: ["Web scraping", "Testing", "Data collection"], createdAt: "2024-02-28",
    githubStars: 14200, language: "Python", license: "MIT", isOpenSource: true
  },
  {
    id: "12", slug: "devops-copilot", name: "DevOps Copilot", tagline: "AI-powered infrastructure management",
    description: "DevOps Copilot automates CI/CD pipelines, monitors infrastructure health, and handles incident response.",
    category: "devops", agentType: "devops", architectures: ["autonomous", "workflow", "tool-use"],
    domains: ["cybersecurity"], ecosystem: "startup", provider: "InfraAI", country: "US",
    tags: ["devops", "infrastructure", "monitoring"],
    pricing: "paid", rating: 4.4, reviewCount: 760, imageUrl: "",
    website: "https://example.com", features: ["CI/CD automation", "Infra monitoring", "Incident response", "Cost optimization"],
    useCases: ["Cloud management", "Deployment automation", "SRE"], createdAt: "2024-03-20",
    githubStars: 3800, language: "Go", license: "BSL-1.1", isOpenSource: false
  },
];

export const categories: Category[] = [
  { slug: "coding", name: "Coding", description: "AI agents for software development", icon: "Code", agentCount: 12 },
  { slug: "creative", name: "Creative", description: "Content and design generation", icon: "PenTool", agentCount: 18 },
  { slug: "data", name: "Data", description: "Data analysis and processing", icon: "BarChart3", agentCount: 15 },
  { slug: "chat", name: "Chat", description: "Conversational AI interfaces", icon: "MessageSquare", agentCount: 22 },
  { slug: "automation", name: "Automation", description: "Workflow and process automation", icon: "Zap", agentCount: 14 },
  { slug: "security", name: "Security", description: "Cybersecurity and threat detection", icon: "Shield", agentCount: 6 },
  { slug: "assistant", name: "Assistant", description: "General-purpose AI assistants", icon: "Bot", agentCount: 20 },
  { slug: "browser", name: "Browser", description: "Web browsing and scraping agents", icon: "Globe", agentCount: 8 },
];

export const tags: Tag[] = [
  { slug: "coding", name: "Coding", agentCount: 12 },
  { slug: "productivity", name: "Productivity", agentCount: 28 },
  { slug: "writing", name: "Writing", agentCount: 18 },
  { slug: "marketing", name: "Marketing", agentCount: 14 },
  { slug: "automation", name: "Automation", agentCount: 14 },
  { slug: "analytics", name: "Analytics", agentCount: 15 },
  { slug: "chatbot", name: "Chatbot", agentCount: 22 },
  { slug: "enterprise", name: "Enterprise", agentCount: 10 },
  { slug: "developer-tools", name: "Developer Tools", agentCount: 12 },
  { slug: "customer-support", name: "Customer Support", agentCount: 9 },
];
