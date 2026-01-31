<template>
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" :class="$attrs.class">
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0%" stop-color="#FFD166" />
        <stop offset="100%" stop-color="#F4A261" />
      </linearGradient>
    </defs>

    <!-- simple decorative motif inspired by Minangkabau roof curve -->
    <g transform="translate(100,100)">
      <path d="M -70 10 C -40 -40, 40 -40, 70 10" fill="none" stroke="#7a0d0d" stroke-width="6" stroke-linecap="round" />
      <path d="M -60 20 C -30 -20, 30 -20, 60 20" fill="none" stroke="url(#g)" stroke-width="4" stroke-linecap="round" />
      <circle cx="0" cy="-6" r="6" fill="#FFD166" />
    </g>
  </svg>
</template>

<script setup>
// purely presentational
</script>

<style scoped>
svg { width: 96px; height: 96px; }
</style>