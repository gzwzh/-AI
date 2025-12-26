import { Routes, Route } from 'react-router-dom'
import { useThemeStore } from '@/stores/theme'
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
import AccountBook from '@/views/tool/AccountBook'
import Memo from '@/views/tool/Memo'
import './App.scss'

function App() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <div className={`app ${theme}`}>
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
        <Route path="/tool/account" element={<AccountBook />} />
        <Route path="/tool/memo" element={<Memo />} />
      </Routes>
    </div>
  )
}

export default App
