import fitmentData from "./vehicle fitments.json" with { type: "json" }

export const DATA = {
  fitments: fitmentData.fitments,
  currentFitment: JSON.parse(localStorage.getItem("vehicleFitment")),
  searchCollection: "/collections/vehicle-search/"
}