<script setup lang="ts">
defineProps<{
  name: string
}>()

const icons: Record<string, string> = {
  // 计算器
  calculator: `<path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h3v4H8v-4zm5 0h3v4h-3v-4z"/>`,
  scientific: `<path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 3h2v1H8v-1zm3 0h2v1h-2v-1zm3 0h2v1h-2v-1zm-6 2h2v3H8v-3zm3 0h2v3h-2v-3zm3 0h2v3h-2v-3z"/>`,
  fraction: `<path d="M12 4v16M6 8h4v2H6V8zm8 6h4v2h-4v-2zM4 12h16"/>`,
  
  // 工具
  currency: `<circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9h6M9 15h6"/>`,
  relative: `<circle cx="12" cy="8" r="3"/><circle cx="6" cy="16" r="2"/><circle cx="18" cy="16" r="2"/><path d="M12 11v2M8 14l2-1M16 14l-2-1"/>`,
  mortgage: `<path d="M3 12l9-9 9 9M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>`,
  tax: `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/><circle cx="16" cy="16" r="2"/>`,
  date: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>`,
  radix: `<path d="M4 6h4v4H4V6zm8 0h4v4h-4V6zm4 8h4v4h-4v-4zM4 14h4v4H4v-4z"/><path d="M10 8h4M14 16h4"/>`,
  uppercase: `<path d="M4 18V6h2l6 12h-2l-1.5-3h-5L2 18h2zm2-5h3l-1.5-4-1.5 4z"/><path d="M14 6h6v2h-6V6zm0 4h6v2h-6v-2zm0 4h4v2h-4v-2z"/>`,
  finance: `<circle cx="12" cy="12" r="9"/><path d="M12 6v2M12 16v2M8 12h8"/><path d="M9 9l6 6M15 9l-6 6"/>`,
  formula: `<path d="M4 6h6M4 12h4M4 18h6"/><path d="M12 4c4 0 6 4 6 8s-2 8-6 8"/>`,
  account: `<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/><circle cx="16" cy="15" r="1"/>`,
  memo: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>`,
  
  // 单位换算
  length: `<path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/><path d="M8 8v8M16 8v8"/>`,
  area: `<rect x="4" y="4" width="16" height="16"/><path d="M4 10h16M4 16h16M10 4v16M16 4v16"/>`,
  volume: `<path d="M4 8l8-4 8 4v8l-8 4-8-4V8z"/><path d="M4 8l8 4 8-4M12 12v8"/>`,
  temperature: `<path d="M12 4v12"/><circle cx="12" cy="18" r="3"/><path d="M9 4h6M9 8h6M9 12h6"/>`,
  speed: `<circle cx="12" cy="14" r="8"/><path d="M12 14l4-6"/><path d="M8 10h8"/>`,
  time: `<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>`,
  weight: `<path d="M4 18h16l-2-10H6L4 18z"/><circle cx="12" cy="6" r="2"/>`,
  power: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`,
  heat: `<path d="M12 2c-4 4-6 6-6 10a6 6 0 1012 0c0-4-2-6-6-10z"/><path d="M12 12v6"/>`,
  force: `<path d="M4 12h12M16 12l-4-4M16 12l-4 4"/><circle cx="19" cy="12" r="2"/>`,
  pressure: `<rect x="4" y="8" width="16" height="8" rx="1"/><path d="M8 8V6M12 8V4M16 8V6"/><path d="M8 16v2M12 16v4M16 16v2"/>`,
  capacity: `<path d="M6 4h12v16H6V4z"/><path d="M6 8h12M6 12h12M6 16h12"/><path d="M10 4V2M14 4V2"/>`,
  data: `<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 10h2v4H8v-4zm3 0h2v4h-2v-4zm3 0h2v4h-2v-4z"/><path d="M4 10h16"/>`,
}
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <g v-html="icons[name] || icons.calculator"></g>
  </svg>
</template>
