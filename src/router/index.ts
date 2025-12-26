import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  // 计算器
  {
    path: '/calculator/basic',
    name: 'BasicCalculator',
    component: () => import('@/views/calculator/BasicCalculator.vue')
  },
  {
    path: '/calculator/scientific',
    name: 'ScientificCalculator',
    component: () => import('@/views/calculator/ScientificCalculator.vue')
  },
  {
    path: '/calculator/fraction',
    name: 'FractionCalculator',
    component: () => import('@/views/calculator/FractionCalculator.vue')
  },
  {
    path: '/converter/:type',
    name: 'Converter',
    component: () => import('@/views/converter/UnitConverter.vue')
  },
  {
    path: '/tool/currency',
    name: 'CurrencyConverter',
    component: () => import('@/views/tool/CurrencyConverter.vue')
  },
  {
    path: '/tool/radix',
    name: 'RadixConverter',
    component: () => import('@/views/tool/RadixConverter.vue')
  },
  {
    path: '/tool/uppercase',
    name: 'UppercaseMoney',
    component: () => import('@/views/tool/UppercaseMoney.vue')
  },
  {
    path: '/tool/date',
    name: 'DateCalculator',
    component: () => import('@/views/tool/DateCalculator.vue')
  },
  {
    path: '/tool/mortgage',
    name: 'MortgageCalculator',
    component: () => import('@/views/tool/MortgageCalculator.vue')
  },
  {
    path: '/tool/tax',
    name: 'TaxCalculator',
    component: () => import('@/views/tool/TaxCalculator.vue')
  },
  {
    path: '/tool/finance',
    name: 'FinanceCalculator',
    component: () => import('@/views/tool/FinanceCalculator.vue')
  },
  {
    path: '/tool/relative',
    name: 'RelativeCalculator',
    component: () => import('@/views/tool/RelativeCalculator.vue')
  },
  {
    path: '/tool/formula',
    name: 'FormulaCalculator',
    component: () => import('@/views/tool/FormulaCalculator.vue')
  },
  {
    path: '/tool/account',
    name: 'AccountBook',
    component: () => import('@/views/tool/AccountBook.vue')
  },
  {
    path: '/tool/memo',
    name: 'Memo',
    component: () => import('@/views/tool/Memo.vue')
  },
  {
    path: '/tool/:type',
    name: 'Tool',
    component: () => import('@/views/Tool.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
