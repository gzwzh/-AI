import { moduleCategories } from '@/config/modules'
import ModuleCard from '@/components/ModuleCard'
import ThemeToggle from '@/components/ThemeToggle'
import './Home.scss'

export default function Home() {
  return (
    <div className="home">
      <header className="header">
        <h1 className="title">鲲穹AI计算器</h1>
        <ThemeToggle />
      </header>
      
      <main className="main">
        {moduleCategories.map((category) => (
          <section key={category.id} className="category">
            <h2 className="category-title">{category.name}</h2>
            <div className="module-grid">
              {category.modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
