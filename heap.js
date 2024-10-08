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

module.exports = { pushHeap, popHeap }
