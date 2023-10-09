export default async function localImagesLoader({
  src,
  width,
  quality = 80,
}: {
  src: string
  width: number
  quality?: number
}) {
  const relativeSrc = new URL(src).pathname
  const encodedSrc = encodeURIComponent(relativeSrc)
  return (
    process.env.NEXT_PUBLIC_IMAGE_HOST +
    `/api/resize?url=${encodedSrc}&width=${width}&quality=${quality}`
  )
}
