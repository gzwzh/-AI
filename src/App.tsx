import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useHistoryStore } from '@/stores/history'
import UpdateModal from '@/components/UpdateModal'
import WindowControls from '@/components/WindowControls'
import HistorySidebar from '@/components/HistorySidebar'
import Home from '@/views/Home'
import BasicCalculator from '@/views/calculator/BasicCalculator'
import ScientificCalculator from '@/views/calculator/ScientificCalculator'
import FractionCalculator from '@/views/calculator/FractionCalculator'
import UnitConverter from '@/views/converter/UnitConverter'
import CurrencyConverter from '@/views/tool/CurrencyConverter'
import RadixConverter from '@/views/tool/RadixConverter'
import UppercaseMoney from '@/views/tool/UppercaseMoney'
import DateCalculator from '@/views/tool/DateCalculator'
import MortgageCalculator from '@/views/tool/MortgageCalculator'
import TaxCalculator from '@/views/tool/TaxCalculator'
import FinanceCalculator from '@/views/tool/FinanceCalculator'
import RelativeCalculator from '@/views/tool/RelativeCalculator'
import FormulaCalculator from '@/views/tool/FormulaCalculator'
import DiscountCalculator from '@/views/tool/DiscountCalculator'
import HealthCalculator from '@/views/tool/HealthCalculator'
import GraphCalculator from '@/views/tool/GraphCalculator'
import AccountBook from '@/views/tool/AccountBook'
import Memo from '@/views/tool/Memo'
import './App.scss'

function App() {
  const theme = useThemeStore((state) => state.theme)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const isHistoryOpen = useHistoryStore((state) => state.isOpen)
  const [version, setVersion] = useState('')

  // 应用启动时初始化登录状态
  useEffect(() => {
    initializeAuth()
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setVersion).catch(console.error)
    }
  }, [initializeAuth])

  return (
    <div className={`app ${theme} ${isHistoryOpen ? 'sidebar-open' : ''}`}>
      <UpdateModal />
      <HistorySidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator/basic" element={<BasicCalculator />} />
        <Route path="/calculator/scientific" element={<ScientificCalculator />} />
        <Route path="/calculator/fraction" element={<FractionCalculator />} />
        <Route path="/converter/:type" element={<UnitConverter />} />
        <Route path="/tool/currency" element={<CurrencyConverter />} />
        <Route path="/tool/radix" element={<RadixConverter />} />
        <Route path="/tool/uppercase" element={<UppercaseMoney />} />
        <Route path="/tool/date" element={<DateCalculator />} />
        <Route path="/tool/mortgage" element={<MortgageCalculator />} />
        <Route path="/tool/tax" element={<TaxCalculator />} />
        <Route path="/tool/finance" element={<FinanceCalculator />} />
        <Route path="/tool/relative" element={<RelativeCalculator />} />
        <Route path="/tool/formula" element={<FormulaCalculator />} />
        <Route path="/tool/discount" element={<DiscountCalculator />} />
        <Route path="/tool/health" element={<HealthCalculator />} />
        <Route path="/tool/graph" element={<GraphCalculator />} />
        <Route path="/tool/account" element={<AccountBook />} />
        <Route path="/tool/memo" element={<Memo />} />
      </Routes>
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        fontSize: '12px',
        color: 'var(--text-secondary, #999)',
        opacity: 0.7,
        zIndex: 999,
        pointerEvents: 'none'
      }}>
        v{version}
      </div>
    </div>
  )
}

export default App
