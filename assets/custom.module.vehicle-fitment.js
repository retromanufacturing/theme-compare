import { DATA as vehicleData } from "./custom.module.vehicle-search-data.js"

export function getFitmentText(fitment) {
  const { fitment: fitmentName, year, make, model } = fitment
  console.log(fitmentName)
  return fitmentName || [year, make, model].filter(Boolean).join(' ')
}

export function getFitmentLink(fitment) {
  const { collection, params } = fitment
  if (!collection) return ''
  return `${vehicleData.searchCollection}${collection}${encodeURI(params || '')}`
}