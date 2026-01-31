const fs = require('fs')
const path = require('path')
const STORE = path.join(__dirname, 'data', 'menu.json')

function load() {
  try {
    const raw = fs.readFileSync(STORE, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    return []
  }
}

function save(arr) {
  try {
    fs.writeFileSync(STORE, JSON.stringify(arr, null, 2), 'utf8')
    return true
  } catch (err) {
    return false
  }
}

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8)
}

module.exports = { load, save, id }
