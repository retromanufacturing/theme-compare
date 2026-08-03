import { DATA as vehicleData } from "./vehicle-search-data.js"

export function getFitmentText(fitment) {
  const { fitment: fitmentName, year, make, model } = fitment
  return fitmentName || [year, make, model].filter(Boolean).join(' ')
}

export function getFitmentLink(fitment) {
  const { collection, params } = fitment
  if (!collection) return ''
  return `${vehicleData.searchCollection}${collection}${encodeURI(params || '')}`
}