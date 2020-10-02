/*

 global.js

*/

// Import Modules.
import App from '@/Apps/AppGlobal'

// Created Instance.
const app = new App()

// Initial.
app.init()

// DOM Content Loaded.
window.addEventListener('DOMContentLoaded', () => {
  // Call DOM Content Loaded Method.
  app.domContentLoaded()
})

// Load.
window.addEventListener('load', () => {
  // Call Load Method.
  app.load()
})

// Resize.
window.addEventListener('resize', () => {
  // Call Resize Method.
  app.resize()
})

// Scroll.
window.addEventListener('scroll', () => {
  // Call Scroll Method.
  app.scroll()
})
