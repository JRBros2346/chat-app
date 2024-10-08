async function appendMessage (message, id) {
  const tr = document.createElement('tr')
  tr.id = `msg${id}`
  const th = document.createElement('th')
  th.innerText = message.user
  tr.appendChild(th)
  const td = document.createElement('td')

  if (message.text) {
    const p = document.createElement('p')
    p.innerText = message.text
    td.appendChild(p)
  }
  // Check if the message contains an image URL
  if (message.image) {
    const img = document.createElement('img')
    img.src = message.image
    img.alt = message.text
    td.appendChild(img)
  }
  tr.appendChild(td)
  messages.appendChild(tr)

  // Ensure the messages scroll to the bottom when new content is added
  document.getElementById('messages-container').scrollTop = document.getElementById('messages-container').scrollHeight
  console.log(`${message.user}: ${message.text}`)
}

async function poll (id) {
  const message = localStorage.getItem(`msg${id}`)
  if (message) {
    appendMessage(JSON.parse(message), id)
    return
  }

  const response = await fetch('/poll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })

  if (response.ok) {
    const message = await response.json()
    appendMessage(message, id)
    localStorage.setItem(`msg${id}`, JSON.stringify(message))
  }
}

// Image preview handling
const image = document.getElementById('image')
const label = document.getElementById('image-label')
image.addEventListener('change', () => {
  const imageFile = image.files[0]

  if (imageFile) {
    const reader = new FileReader()
    reader.onload = () => {
      const img = document.createElement('img')
      img.src = reader.result
      label.innerHTML = '' // Clear existing content
      label.appendChild(img)

      const clear = document.createElement('button')
      clear.id = 'clear'
      clear.textContent = 'Clear Image'
      clear.addEventListener('click', () => {
        image.value = '' // Clear file input
        label.innerHTML = 'Upload Image' // Reset label content
      })
      label.appendChild(clear)
    }
    reader.readAsDataURL(imageFile)
  }
})

const messages = document.getElementById('messages')
document.getElementById('message').addEventListener('submit', async e => {
  e.preventDefault()

  const text = document.getElementById('text').value
  const imageFile = document.getElementById('image').files[0]
  const user = localStorage.getItem('user')

  const formData = new FormData()
  formData.append('user', user)
  formData.append('text', text)

  if (imageFile) {
    formData.append('image', imageFile)
  }

  await fetch('/new', {
    method: 'POST',
    body: formData
  })

  // Reset form fields after submission
  document.getElementById('text').value = ''
  document.getElementById('image').value = ''
  label.innerHTML = 'Upload Image' // Reset image label
})

if (!localStorage.getItem('user')) localStorage.setItem('user', prompt('Username: '))

async function run () {
  let i = 0
  while (true) {
    await poll(i)
    ++i
  }
}
run()
