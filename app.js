const express = require('express')

const app = express()
const port = 3333

function pushHeap (heap, value) {
  heap.push(value)
  let index = heap.length - 1
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2)
    if (heap[index][0] < heap[parent][0]) {
      [heap[index], heap[parent]] = [heap[parent], heap[index]]
      index = parent
    } else break
  }
}

function popHeap (heap) {
  if (heap.length === 0) return null
  const root = heap[0]
  const last = heap.pop()
  if (heap.length > 0) {
    heap[0] = last
    let index = 0
    const length = heap.length
    while (true) {
      const left = 2 * index + 1
      const right = 2 * index + 2
      let swap = null
      if (left < length && heap[left][0] < heap[index][0]) swap = left
      if (right < length && (swap === null ? heap[right][0] < heap[index][0] : heap[right][0] < heap[swap][0])) swap = right
      if (swap === null) break;
      [heap[index], heap[swap]] = [heap[swap], heap[index]]
      index = swap
    }
  }
  return root
}

const messages = [{ user: '', text: 'Welcome to Cyber Security' }]
const waiting = []

app.use('/static', express.static('static'))
app.use(express.json())

app.get('/', (req, res) => res.sendFile('home.html', { root: __dirname }))

app.post('/poll', (req, res) => {
  const id = req.body.id
  if (typeof messages[id] === 'undefined') {
    pushHeap(waiting, [id, res])
  } else {
    res.json(messages[id])
  }
})

app.post('/new', (req, res) => {
  if (!req.body.user || !req.body.text) {
    return res.status(400).json({ error: 'Invalid message format' })
  }

  const { user, text } = req.body

  console.log(`${user}: ${text}`)

  messages.push({ user, text })

  while (waiting.length > 0) {
    const [priority, client] = waiting[0]
    if (priority < messages.length) {
      client.json(messages[priority])
      popHeap(waiting)
    } else break
  }

  res.status(201).json(req.body)
})

app.listen(port, '0.0.0.0', () => console.log(`Server running at http://localhost:${port}`))
