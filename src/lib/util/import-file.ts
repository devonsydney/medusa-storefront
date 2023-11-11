export const importFile = async (filePath?: string) => {
  if (!filePath) {
    return undefined;
  }
  const response = await fetch(filePath)
  const markdown = await response.text()
  return markdown
}
