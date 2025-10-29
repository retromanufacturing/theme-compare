console.log("vehicle search header")

document.addEventListener("DOMContentLoaded", () => {
  if (data.currentFitment) {
    document.dispatchEvent(new CustomEvent("custom:setVehicleSearch", {
      detail: { data: data.currentFitment },
    }));
  } else {
    document.dispatchEvent(new CustomEvent("custom:loadVehicleSearch", {
      detail: { data: data.fitments },
    }));
  }
});

let arrays = {
  years: [],
  makes: [],
  models: [],
  yearOptions: `<option selected>Select Year</option>`,
  makeOptions: `<option selected>Select Make</option>`,
  modelOptions: `<option selected>Select Model</option>`,
};

let current = {
  year: "",
  make: "",
  model: "",
  id: "",
};

let data = {
  fitments: theme.strings.vehicleFitmentData,
  currentFitment: JSON.parse(localStorage.getItem("vehicleFitment")),
  search: '/collections/vehicle-search/'
  // search: theme.custom.vehicleSearchCollection,
};

let selectors = {
  year: document.querySelectorAll(".js-ymm--year"),
  make: document.querySelectorAll(".js-ymm--make"),
  model: document.querySelectorAll(".js-ymm--model"),
  search: document.querySelectorAll(".js-ymm--search"),
  reset: document.querySelectorAll(".js-ymm--reset"),
};

document.addEventListener("custom:loadVehicleSearch", () => {
  console.log("vehicle search running")
  // enableReset();
  // document.dispatchEvent(new CustomEvent("custom:optionselected", {
  //   detail: { data: { type: "onload" } },
  // }));
});

document.addEventListener("custom:optionselected", (e) => {
  const fitment = e.detail.data;
  const type = fitment.type;
  const value = fitment.value;
  const searchId = e.target?.activeElement?.dataset.fitmentId;

  let fitmentdata = fetch(data.fitments)
    .then((response) => response.json());

  switch (type) {
    case "onload":
      getYearOption(fitmentdata);
      break;
    case "year":
      current.year = value;
      getMakeOption(fitmentdata, value);
      break;
    case "make":
      current.make = value;
      getModelOption(fitmentdata, value, current.year);
      break;
    case "model":
      current.model = value;
      enableSearch(searchId);
      break;
  }
});

document.addEventListener("custom:searchFitment", (e) => {
  const fitment = e.detail.data;
  storeFitment(fitment);
  window.location = `${fitment.search}${fitment.tags}${fitment.params}`;
});

document.addEventListener("custom:resetFitment", (e) => {
  const id = e.detail.id;
  resetFitment(id);
  disableSearch();
});

function getYearOption(options) {
  options.then(data => {
    data.fitments.forEach(f => arrays.years.push(`<option value="${f.year}">${f.year}</option>`));
    const uniq = [...new Set(arrays.years)].sort();
    setSelectorOptions(uniq, selectors.year, arrays.yearOptions);
  });
}

function getMakeOption(options, year) {
  options.then(data => {
    arrays.makes = [];
    data.fitments.forEach(f => {
      if (f.year == year) arrays.makes.push(`<option value="${f.make}">${f.make}</option>`);
    });
    const uniq = [...new Set(arrays.makes)].sort();
    setSelectorOptions(uniq, selectors.make, arrays.makeOptions);
  });
}

function getModelOption(options, make, year) {
  options.then(data => {
    arrays.models = [];
    data.fitments.forEach(f => {
      if (f.year == year && f.make == make) {
        arrays.models.push(`<option value="${f.model}">${f.model}</option>`);
      }
    });
    const uniq = [...new Set(arrays.models)].sort();
    setSelectorOptions(uniq, selectors.model, arrays.modelOptions);
  });
}

function setSelectorOptions(options, elements, base) {
  elements.forEach(select => {
    select.removeAttribute("disabled");
    select.innerHTML = base + options.join('');
    select.addEventListener("change", (e) => {
      const details = {
        value: e.target.value,
        id: select.dataset.fitmentId,
        type: select.dataset.fitmentType,
      };
      select.dataset.fitment = details.value;
      document.dispatchEvent(new CustomEvent("custom:optionselected", {
        detail: { data: details },
      }));
    });
  });
}

function enableSearch(searchId) {
  selectors.search.forEach(btn => {
    btn.removeAttribute("disabled");
    btn.addEventListener("click", () => {
      const vehicle = {
        year: current.year,
        make: current.make,
        model: current.model,
        search: data.search,
        tags: `${current.year}+${current.make}+${current.model}`.replace(/[ /]/g, "-"),
        params: `?rq=yr_${current.year}~mk_${current.make}~md_${current.model}`,
        fitment: `${current.year} ${current.make} ${current.model}`,
        id: searchId
      };
      document.dispatchEvent(new CustomEvent("custom:searchFitment", {
        detail: { data: vehicle },
      }));
    });
  });
}

function disableSearch() {
  selectors.search.forEach(btn => btn.disabled = true);
}

function enableReset() {
  selectors.reset.forEach(reset => {
    reset.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("custom:resetFitment", {
        detail: { id: reset.dataset.resetId }
      }));
    });
  });
}

function resetFitment(id) {
  const selects = {
    year: document.getElementById(`${id}--year`),
    make: document.getElementById(`${id}--make`),
    model: document.getElementById(`${id}--model`)
  };
  selects.year.selectedIndex = selects.make.selectedIndex = selects.model.selectedIndex = 0;
}

function storeFitment(fitment) {
  localStorage.setItem("vehicleFitment", JSON.stringify(fitment));
}
