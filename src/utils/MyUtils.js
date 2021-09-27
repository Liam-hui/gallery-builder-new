export const randomId = () => {
  return Math.random().toString(36).substr(2, 9)
}

export const toArrayOrderBySequence = (data) => {
  const array = Object.entries(data).map(([id, item]) => {
    item.id = id
    return item
  })
  array.sort(function(a, b) {
    return parseFloat(a.sequence) - parseFloat(b.sequence)
  })
  array.forEach((item, index) => {
    item.sequence = index
  })
  return array
}

export const getTitle = (title, name) => {
  const sub = '{**Customer_INPUT**}'
  const startPos = title.indexOf(sub)
  const endPos = startPos + sub.length

  if (startPos == -1) 
    return title
  else 
    return title.substr(0, startPos) + name + title.substr(endPos, title.length - endPos)
}

export const convertDataURIToBlob = (dataURI) => {
  const BASE64_MARKER = ';base64,'

  if (!dataURI) return

  // Convert image (in base64) to binary data
  const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
  const base64 = dataURI.substring(base64Index)
  const raw = window.atob(base64)
  const rawLength = raw.length
  const array = new Uint8Array(new ArrayBuffer(rawLength))

  for(let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
  }

  const imageDataBlob = new Blob([array], { type: "image/jpeg" })
  return URL.createObjectURL(imageDataBlob);
}