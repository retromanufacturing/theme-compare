export function getFitmentText(fitment) {
  const { fitment: fitmentName, year, make, model } = fitment
  return fitmentName || [year, make, model].filter(Boolean).join(' ')
}

export function getFitmentLink(fitment, searchCollection) {
  const { collection, params } = fitment
  if (!collection) return ''
  return `${searchCollection}${collection}${encodeURI(params || '')}`
}