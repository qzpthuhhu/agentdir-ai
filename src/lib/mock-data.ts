import { Agent, Category, Tag } from "@/types/agent";

export const agents: Agent[] = [
  {
    id: "1", slug: "codex-ai", name: "Codex AI", tagline: "Your AI pair programmer",
    description: "Codex AI transforms how developers write code. It understands context, generates production-ready code, and helps debug complex issues in real-time.",
    category: "coding", tags: ["coding", "productivity", "developer-tools"],
    pricing: "freemium", rating: 4.8, reviewCount: 2340, imageUrl: "",
    website: "https://example.com", features: ["Code generation", "Bug detection", "Refactoring suggestions", "Multi-language support"],
    useCases: ["Web development", "API design", "Code review"], createdAt: "2024-01-15"
  },
  {
    id: "2", slug: "content-forge", name: "Content Forge", tagline: "AI-powered content creation engine",
    description: "Content Forge generates high-quality blog posts, social media content, and marketing copy in seconds. Trained on millions of high-performing pieces.",
    category: "writing", tags: ["writing", "marketing", "content"],
    pricing: "paid", rating: 4.5, reviewCount: 1820, imageUrl: "",
    website: "https://example.com", features: ["Blog writing", "Social media posts", "SEO optimization", "Brand voice matching"],
    useCases: ["Content marketing", "Social media management", "SEO"], createdAt: "2024-02-20"
  },
  {
    id: "3", slug: "vision-lens", name: "Vision Lens", tagline: "See the world through AI eyes",
    description: "Vision Lens analyzes images and videos with state-of-the-art computer vision. From object detection to scene understanding, it handles it all.",
    category: "image", tags: ["image", "computer-vision", "analytics"],
    pricing: "enterprise", rating: 4.7, reviewCount: 980, imageUrl: "",
    website: "https://example.com", features: ["Object detection", "Scene analysis", "OCR", "Image generation"],
    useCases: ["Quality control", "Medical imaging", "Security"], createdAt: "2024-03-10"
  },
  {
    id: "4", slug: "data-whisperer", name: "Data Whisperer", tagline: "Turn raw data into insights",
    description: "Data Whisperer connects to your databases and automatically surfaces trends, anomalies, and actionable insights through natural language queries.",
    category: "data", tags: ["data", "analytics", "business-intelligence"],
    pricing: "freemium", rating: 4.6, reviewCount: 1560, imageUrl: "",
    website: "https://example.com", features: ["Natural language queries", "Auto-visualization", "Anomaly detection", "Report generation"],
    useCases: ["Business analytics", "Financial reporting", "Market research"], createdAt: "2024-01-28"
  },
  {
    id: "5", slug: "chat-symphony", name: "Chat Symphony", tagline: "Orchestrate perfect conversations",
    description: "Chat Symphony builds intelligent chatbots that understand context, handle complex multi-turn conversations, and integrate with any platform.",
    category: "chatbot", tags: ["chatbot", "customer-support", "automation"],
    pricing: "paid", rating: 4.4, reviewCount: 2100, imageUrl: "",
    website: "https://example.com", features: ["Multi-turn dialogue", "Sentiment analysis", "Platform integration", "Custom training"],
    useCases: ["Customer support", "Sales automation", "Internal helpdesk"], createdAt: "2024-02-05"
  },
  {
    id: "6", slug: "auto-flow", name: "AutoFlow", tagline: "Automate any workflow with AI",
    description: "AutoFlow watches how you work and suggests automations. Connect apps, trigger actions, and let AI handle the repetitive stuff.",
    category: "automation", tags: ["automation", "productivity", "workflow"],
    pricing: "free", rating: 4.3, reviewCount: 3200, imageUrl: "",
    website: "https://example.com", features: ["Workflow builder", "App integrations", "Smart triggers", "Error handling"],
    useCases: ["Process automation", "Data entry", "Email workflows"], createdAt: "2024-03-01"
  },
  {
    id: "7", slug: "lingua-bridge", name: "Lingua Bridge", tagline: "Break every language barrier",
    description: "Lingua Bridge provides real-time translation across 100+ languages with context awareness and cultural nuance preservation.",
    category: "language", tags: ["translation", "language", "communication"],
    pricing: "freemium", rating: 4.9, reviewCount: 4500, imageUrl: "",
    website: "https://example.com", features: ["100+ languages", "Real-time translation", "Context-aware", "Document translation"],
    useCases: ["Global business", "Travel", "Content localization"], createdAt: "2024-01-10"
  },
  {
    id: "8", slug: "secure-sentinel", name: "Secure Sentinel", tagline: "AI-powered cybersecurity guardian",
    description: "Secure Sentinel monitors your infrastructure 24/7, detects threats in real-time, and automatically responds to security incidents.",
    category: "security", tags: ["security", "monitoring", "enterprise"],
    pricing: "enterprise", rating: 4.8, reviewCount: 870, imageUrl: "",
    website: "https://example.com", features: ["Threat detection", "Incident response", "Compliance monitoring", "Vulnerability scanning"],
    useCases: ["Enterprise security", "Compliance", "Threat hunting"], createdAt: "2024-02-14"
  },
];

export const categories: Category[] = [
  { slug: "coding", name: "Coding", description: "AI agents for software development", icon: "Code", agentCount: 12 },
  { slug: "writing", name: "Writing", description: "Content creation and copywriting", icon: "PenTool", agentCount: 18 },
  { slug: "image", name: "Image & Vision", description: "Computer vision and image processing", icon: "Eye", agentCount: 9 },
  { slug: "data", name: "Data & Analytics", description: "Business intelligence and data analysis", icon: "BarChart3", agentCount: 15 },
  { slug: "chatbot", name: "Chatbots", description: "Conversational AI and chat interfaces", icon: "MessageSquare", agentCount: 22 },
  { slug: "automation", name: "Automation", description: "Workflow and process automation", icon: "Zap", agentCount: 14 },
  { slug: "language", name: "Language", description: "Translation and NLP tools", icon: "Languages", agentCount: 8 },
  { slug: "security", name: "Security", description: "Cybersecurity and threat detection", icon: "Shield", agentCount: 6 },
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
