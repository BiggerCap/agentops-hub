"use client"

import { Badge } from "@/components/ui/badge"
import { 
  SiNextdotjs, 
  SiReact, 
  SiTypescript, 
  SiTailwindcss,
  SiRadixui,
  SiFastapi,
  SiPython,
  SiPostgresql,
  SiDocker,
  SiGit,
  SiEslint,
  SiOpenai,
  SiPydantic
} from "react-icons/si"
import { 
  TbBrandFramerMotion,
  TbDatabase,
  TbLock,
  TbShieldCheck,
  TbVector,
  TbBrain,
  TbSearch,
  TbRefresh
} from "react-icons/tb"
import { Database, Package, Zap, Code2 } from "lucide-react"

const techStack = [
  {
    category: "Frontend",
    icon: SiReact,
    color: "blue",
    technologies: [
      { name: "Next.js 16.0", Icon: SiNextdotjs },
      { name: "React 19.2", Icon: SiReact },
      { name: "TypeScript", Icon: SiTypescript },
      { name: "Tailwind CSS", Icon: SiTailwindcss },
      { name: "shadcn/ui", Icon: Code2 },
      { name: "Radix UI", Icon: SiRadixui },
      { name: "Lucide Icons", Icon: Zap },
      { name: "React Hook Form", Icon: TbBrandFramerMotion },
    ],
  },
  {
    category: "Backend",
    icon: SiFastapi,
    color: "purple",
    technologies: [
      { name: "FastAPI", Icon: SiFastapi },
      { name: "Python 3.13", Icon: SiPython },
      { name: "Pydantic", Icon: SiPydantic },
      { name: "SQLAlchemy", Icon: Database },
      { name: "PostgreSQL", Icon: SiPostgresql },
      { name: "JWT Auth", Icon: TbShieldCheck },
      { name: "Bcrypt", Icon: TbLock },
      { name: "CORS", Icon: TbRefresh },
    ],
  },
  {
    category: "AI & RAG",
    icon: TbBrain,
    color: "green",
    technologies: [
      { name: "LlamaIndex", Icon: TbDatabase },
      { name: "OpenAI", Icon: SiOpenai },
      { name: "Qdrant", Icon: TbSearch },
      { name: "Vector DB", Icon: TbVector },
      { name: "Embeddings", Icon: TbBrain },
      { name: "RAG Pipeline", Icon: TbRefresh },
    ],
  },
  {
    category: "DevOps",
    icon: SiDocker,
    color: "orange",
    technologies: [
      { name: "Docker", Icon: SiDocker },
      { name: "Docker Compose", Icon: Package },
      { name: "Git", Icon: SiGit },
      { name: "ESLint", Icon: SiEslint },
      { name: "PostCSS", Icon: Code2 },
    ],
  },
]

export function TechStack() {
  return (
    <section id="tech-stack" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4">Tech Stack</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Built with{" "}
              <span className="gradient-text">
                modern technologies
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A production-ready stack combining the best tools for performance, scalability, and developer experience.
            </p>
          </div>

          {/* Technology Groups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {techStack.map((group) => {
              const CategoryIcon = group.icon
              return (
                <div
                  key={group.category}
                  className="glass-card p-8 rounded-xl border border-primary/10"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <CategoryIcon className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">{group.category}</h3>
                  </div>

                  {/* Technology Icons Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {group.technologies.map((tech) => {
                      const TechIcon = tech.Icon
                      return (
                        <div
                          key={tech.name}
                          className="flex flex-col items-center justify-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
                          title={tech.name}
                        >
                          <TechIcon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform text-foreground/70 group-hover:text-foreground" />
                          <p className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
                            {tech.name}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
