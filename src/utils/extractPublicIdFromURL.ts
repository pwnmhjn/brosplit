

export default function extractPublicIdFromURL(url: string) {
  if (url === null) return;
  const arrayAfterURLSplash = url.split("/")
  const lastValueOfArray = arrayAfterURLSplash[arrayAfterURLSplash.length - 1]
  const valueArrayAfterSplit = lastValueOfArray.split(".")
  const public_id = valueArrayAfterSplit[0]
  return public_id
}

