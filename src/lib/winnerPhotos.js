// Finds winner photos automatically.
//
//   src/assets/winners/ritesh.jpg
//
// In src/data/events.js write the file name:  photo: 'ritesh.jpg'
// (capital letters do not matter). A missing photo shows the person's initials.

const files = import.meta.glob('../assets/winners/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const byName = {}
for (const [path, url] of Object.entries(files)) {
  byName[path.split('/').pop().toLowerCase()] = url
}

export function getWinnerPhoto(file) {
  if (!file) return ''
  return byName[String(file).trim().toLowerCase()] || ''
}
