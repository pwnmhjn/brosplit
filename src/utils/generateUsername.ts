export default function generateUsername(url: string) {
  if (url === null) return;
  const ArrayOfEmail = url.split('@');
  const username = ArrayOfEmail[0]
  return username;
}
