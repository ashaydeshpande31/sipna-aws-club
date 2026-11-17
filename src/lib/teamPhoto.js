// Finds the group team photo automatically.
//
//   Put ONE photo in   src/assets/team-photo/   (any file name, e.g. IMG_2034.jpg)
//
// If the folder has no photo, the banner on the Team section stays hidden.
// With more than one photo the first one (by file name) is used.

const files = import.meta.glob('../assets/team-photo/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function getTeamPhoto() {
  const first = Object.keys(files).sort()[0]
  return first ? files[first] : ''
}
