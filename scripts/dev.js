const { exec } = require('child_process')
const { spawn } = require('child_process')
const net = require('net')

const PORTS = [3000, 5173]

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr })
      resolve({ stdout, stderr })
    })
  })
}

function isPortInUse(port, host = '127.0.0.1', timeout = 200) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let settled = false
    socket.setTimeout(timeout)
    socket.once('connect', () => { settled = true; socket.destroy(); resolve(true) })
    socket.once('timeout', () => { if (!settled) { settled = true; socket.destroy(); resolve(false) } })
    socket.once('error', () => { if (!settled) { settled = true; socket.destroy(); resolve(false) } })
    socket.connect(port, host)
  })
}

async function ensurePortsFree() {
  for (const port of PORTS) {
    const busy = await isPortInUse(port)
    if (!busy) continue

    console.warn(`Port ${port} appears to be in use. Please free the port before continuing.`)
    console.warn('Common commands to find and stop the process:')
    if (process.platform === 'win32') {
      console.warn(`  netstat -ano | findstr :${port}  (then taskkill /PID <pid> /F)`)
    } else {
      console.warn(`  lsof -i :${port}  (then kill <pid>)`)
    }
    process.exit(1)
  }
}

function spawnProcess(name, cmd, args, opts = {}) {
  console.log(`Starting ${name}: ${cmd} ${args.join(' ')}`)
  const child = spawn(cmd, args, { shell: true, stdio: ['ignore', 'pipe', 'pipe'], ...opts })

  child.stdout.on('data', d => process.stdout.write(`[${name}] ${d}`))
  child.stderr.on('data', d => process.stderr.write(`[${name}][ERR] ${d}`))

  child.on('exit', (code, sig) => {
    console.log(`${name} exited with ${code != null ? `code ${code}` : `signal ${sig}`}`)
  })

  return child
}

;(async function main() {
  try {
    console.log('Checking ports:', PORTS.join(', '))
    await ensurePortsFree()
    console.log('Ports are free — starting dev processes')

    const server = spawnProcess('server', 'npm', ['run', 'server'])
    const vite = spawnProcess('vite', 'npm', ['run', 'dev'])

    function cleanup() {
      console.log('Shutting down child processes...')
      if (!server.killed) try { process.kill(server.pid) } catch (e) {}
      if (!vite.killed) try { process.kill(vite.pid) } catch (e) {}
      process.exit(0)
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('exit', cleanup)

    // if any child exits, shutdown the other and exit
    server.on('exit', () => { console.log('Server stopped — exiting'); if (!vite.killed) try { process.kill(vite.pid) } catch (e) {}; process.exit(0) })
    vite.on('exit', () => { console.log('Vite stopped — exiting'); if (!server.killed) try { process.kill(server.pid) } catch (e) {}; process.exit(0) })

  } catch (err) {
    console.error('Error during dev startup:', err && err.err && err.err.message ? err.err.message : err)
    process.exit(1)
  }
})()
