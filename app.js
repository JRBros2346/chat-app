const express = require('express')
const { formidable } = require('formidable')
const fs = require('fs')
const path = require('path')
const database = require('./db')
const { pushHeap, popHeap } = require('./heap')

const app = express()
const port = 3333
const host = '0.0.0.0'

const waiting = []

app.use('/static', express.static('static'))
app.use('/', express.static('uploads'))
app.use(express.json())

app.get('/', (req, res) => res.sendFile('home.html', { root: __dirname }))

// Fetch messages from MongoDB
app.post('/poll', async (req, res) => {
  const db = await database()
  const id = req.body.id
  const messages = await db.collection('messages').find().toArray()

  if (id >= messages.length) {
    pushHeap(waiting, [id, res])
  } else {
    res.json(messages[id])
  }
})

// Add new message to MongoDB
app.post('/new', (req, res) => {
  const form = formidable({ multiples: true })
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Form parsing error' })
    }

    const user = fields.user[0]
    const text = fields.text[0]
    const image = files.image ? files.image[0] : undefined

    if (!user || (!text && !image)) {
      return res.status(400).json({ error: 'Invalid message format' })
    }

    if (image) fs.copyFileSync(image.filepath, path.join('uploads', image.originalFilename))

    const db = await database()
    const newMessage = {
      user,
      text,
      image: image ? image.originalFilename : undefined,
      timestamp: new Date()
    }

    await db.collection('messages').insertOne(newMessage)

    const messages = await db.collection('messages').find().toArray()

    while (waiting.length > 0) {
      const [priority, client] = waiting[0]
      if (priority < messages.length) {
        client.json(messages[priority])
        popHeap(waiting)
      } else break
    }

    res.json({ success: true })
  })
})

app.listen(port, host, () => console.log(`Server running at http://localhost:${port}`))
