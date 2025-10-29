document.addEventListener("DOMContentLoaded", (event) => {
  if (data.currentFitment) {
    document.dispatchEvent(
      new CustomEvent("custom:setVehicleSearch", {
        detail: { data: data.currentFitment },
      })
    );
  } else {
    document.dispatchEvent(
      new CustomEvent("custom:loadVehicleSearch", {
        detail: { data: data.fitments },
      })
    );
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
  fitments: theme.custom.vehicleFitmentData, //Url for the vehicle fitments file,
  currentFitment: JSON.parse(localStorage.getItem("vehicleFitment")),
  search: theme.custom.vehicleSearchCollection,
  settings: document.querySelector(".js-ymm--widget")
};

let selectors = {
  year: document.querySelectorAll(".js-ymm--year"),
  make: document.querySelectorAll(".js-ymm--make"),
  model: document.querySelectorAll(".js-ymm--model"),
  search: document.querySelectorAll(".js-ymm--search"),
  reset: document.querySelectorAll(".js-ymm--reset"),
  link: document.querySelectorAll(".js-ymm--link"),
  title: document.querySelectorAll(".js-ymm--title"),
  params: document.querySelectorAll(".js-ymm--params, button.tag_filter-remove a"),
  collectionLink: document.querySelectorAll(".js-ymm--collection"),
  container: document.querySelector(".js-ymm--container"),
  collapsible: document.querySelector(".js-ymm--collapsible"),
  widgetBtn: document.querySelector(".js-ymm--widget-btn"),
  widgetBar: document.querySelector(".js-ymm--widget-bar"),
  widgetIcon: document.querySelector(".js-ymm--widget-icon"),
};

let header = {
  fitmentContainer: document.querySelector(".site-nav__fitment"),           
  fitment: document.querySelector("#HeaderFitment"),           
  products: document.querySelector("#headerFitmentProducts"),            
  reset: document.querySelector("#headerFitmentChange")
}

document.addEventListener("custom:setVehicleSearch", (e) => {
  
  let data = e.detail.data
  
  let vehicle = {
    year: data.year,
    make: data.make,
    model: data.model,
    search: data.search,
    title: data.fitment,
    tags: data.tags,
    query: data.params
  }
  
  let collection = `${vehicle.search}${vehicle.tags}${vehicle.query}`
  
  enableHeaderFitment(vehicle.title, collection)
  setFitmentTitle(vehicle.title, collection)
  setFitmentLink(collection)
  appendSearchUrl(vehicle.query)
  setCurrentFitment(vehicle)
});

document.addEventListener("custom:searchFitment", (e) => {
  let fitment = e.detail.data;

  storeFitment(fitment);
  searchFitment(fitment);
});

document.addEventListener("custom:resetFitment", (e) => {
  let type = e.detail.type
  
  switch (type) {
      case "button":
        let id = e.target.activeElement.dataset.resetId
        resetFitment(id)
        disableSearch()
        break;
      case "header":
        let headerId = e.detail.id
        selectors.container.classList.remove("hide")
        header.fitmentContainer.classList.add("hide")
        resetFitment(headerId)
        disableSearch()        
        break;
    }

});

document.addEventListener("custom:loadVehicleSearch", (e) => {
  console.log("vehicle search running")
  let details = {
    type: "onload",
  };


  widgetButton()
  enableReset()

  document.dispatchEvent(
    new CustomEvent("custom:optionselected", {
      detail: { data: details },
    })
  );
});

document.addEventListener("custom:optionselected", (e) => {
  let fitment = e.detail.data;

  let type = fitment.type;
  let value = fitment.value;
  let id = fitment.id;
  let previous = fitment.fitment;
  let searchId = e.target.activeElement.dataset.fitmentId;

  let fitmentdata = fetch(data.fitments)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

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

function getYearOption(options) {
  let years = options.then(function (data) {
    let fitments = data.fitments;

    fitments.forEach((fitment) => {
      arrays.years.push(
        `<option class="ymm_option-year" value="${fitment.year}">${fitment.year}</option>`
      );
    });

    let uniqyears = [...new Set(arrays.years)].sort();
    setSelectorOptions(uniqyears, selectors.year, arrays.yearOptions);
  });
}

function getMakeOption(options, year) {
  let makes = options.then(function (data) {
    let fitments = data.fitments;
    arrays.makes = [];
    fitments.forEach((fitment) => {
      if (fitment.year == year) {
        arrays.makes.push(
          `<option class="ymm_option-make" value="${fitment.make}">${fitment.make}</option>`
        );
      }
    });

    let uniqmakes = [...new Set(arrays.makes)].sort();
    setSelectorOptions(uniqmakes, selectors.make, arrays.makeOptions);
  });
}

function getModelOption(options, make, year) {
  let models = options.then(function (data) {
    let fitments = data.fitments;
    arrays.models = [];
    fitments.forEach((fitment) => {
      if (fitment.year == year && fitment.make == make) {
        arrays.models.push(
          `<option class="ymm_option-make" value="${fitment.model}">${fitment.model}</option>`
        );
      }
    });

    let uniqmodels = [...new Set(arrays.models)].sort();
    setSelectorOptions(uniqmodels, selectors.model, arrays.modelOptions);
  });
}

function setSelectorOptions(data, option, array) {
  option.forEach((option) => {
    option.removeAttribute("disabled");
    option.innerHTML = array + data;

    option.addEventListener("change", (e) => {
      let details = {
        value: e.target.options[e.target.selectedIndex].value,
        id: option.dataset.fitmentId,
        type: option.dataset.fitmentType,
        fitment: option.dataset.fitment,
        optionId: option.id,
      };

      option.dataset.fitment = details.value;

      document.dispatchEvent(
        new CustomEvent("custom:optionselected", {
          detail: { data: details },
        })
      );
    });
  });
}

function enableSearch(searchId) {
  selectors.search.forEach((search) => {
    search.removeAttribute("disabled");

    search.addEventListener("click", (e) => {
      let vehicle = {
        year: current.year,
        make: current.make,
        model: current.model,
        search: data.search,
        tags: `${current.year}+${current.make}+${current.model}`.replace(/[ /]/g,"-"),
        params: `?rq=yr_${current.year}~mk_${current.make}~md_${current.model}`,
        fitment: `${current.year} ${current.make} ${current.model}`,
        id: searchId
      };

      document.dispatchEvent(
        new CustomEvent("custom:searchFitment", {
          detail: { data: vehicle },
        })
      );
    });
  });
}

function disableSearch() {
  selectors.search.forEach((search) => {
    search.disabled = true
  })
}

function enableReset() {
  selectors.reset.forEach((reset)=> {
  let resetType = 'button'  
  reset.addEventListener("click", (e) => {
      document.dispatchEvent(new CustomEvent("custom:resetFitment", {
        detail: { type: resetType },
      }));
    });  
  })
}

function storeFitment(fitment) {
  let fitmentString = JSON.stringify(fitment);
  window.localStorage.setItem("vehicleFitment", fitmentString)
}

function searchFitment(fitment) {
  let searchUrl = `${fitment.search}${fitment.tags}${fitment.params}`;
  window.location = searchUrl;
}

function resetFitment(id) {
  let selects = {
    year: `${id}--year`,
    make: `${id}--make`,
    model: `${id}--model`,
  }

  let options = {
    year: document.getElementById(selects.year),
    make: document.getElementById(selects.make),
    model: document.getElementById(selects.model),
  }

  options.year.selectedIndex =  options.make.selectedIndex =  options.model.selectedIndex = 0
}

async function setCurrentFitment(vehicle) {                            
  try {                               
    await setSelectorValue(vehicle, selectors.year)  
  } catch (err) {                              
    console.log(err);                       
  }                
}     
    
function setSelectorValue(vehicle, options) {

  options.forEach((option) => {
    let id = option.dataset.fitmentId
    let type = option.dataset.fitmentType
    let optionId = option.id

    switch (type) {
      case "year":
        document.dispatchEvent(new CustomEvent("custom:loadVehicleSearch", {}));
        break;
      case "make":
        break;
      case "model":
        break;
    }
    
  })
}

function enableHeaderFitment(title, collection) {
  // Hide the header when not on the homepage
  if ( window.location.href != theme.routes.homepage ) {          
//    selectors.container.classList.add("hide")                   
  } 

  //Display header fitment and link
   header.fitmentContainer.classList.remove("hide")   
   header.fitment.href = header.products.href = collection

   if (title == 'undefined'){
     header.fitment.innerHTML = 'No Vehicle Selected'
   } else {
     header.fitment.innerHTML = title
   }

   header.reset.setAttribute("data-reset-id", data.currentFitment.id) 

   header.reset.addEventListener("click", (e) => {
      let resetType = 'header'
      document.dispatchEvent(new CustomEvent("custom:resetFitment", {
        detail: { type: resetType, id: header.reset.dataset.resetId },
      }));
    }); 
}

function setFitmentTitle(vehicleTitle, url) {
  selectors.title.forEach((title) => {
    if(title.classList.contains("js-ymm-link-placeholder")){
      title.innerHTML = `<center><a href="${url}">${vehicleTitle}</a></center>`
    } else {
      title.innerHTML = vehicleTitle
    }    
  });
}

function setFitmentLink(collection) {
  selectors.link.forEach((link) => {
     let url = link.getAttribute("href")
     link.setAttribute("href",collection)
  })
}

function appendSearchUrl(query) {
  selectors.params.forEach((param) =>{
    let url = param.getAttribute("href")
    let queryUrl = url + query
    param.setAttribute("href", queryUrl)
  })
}

function widgetButton() {
  let button = selectors.widgetBtn;
  let id = button.dataset.btnId;
  let status = button.dataset.btnStatus;

  let statuses = {
    open: button.dataset.btnOpened,
    close: button.dataset.btnClosed,
    reset: button.dataset.btnReset,
  };

  button.addEventListener("click", (e) => {

    switch (status) {
      case "opened":
        button.innerHTML = statuses.open;
        status = "closed";
        break;
      case "closed":
        button.innerHTML = statuses.close;
        status = "opened";
        break;
      case "reset":
        status = "opened";
        document.dispatchEvent(
          new CustomEvent("custom:resetFitment", {
            detail: { data: id, status: statuses },
          })
        );
        break;
    }
  });
}

function widgetIcon(status) {
  let icon = selectors.widgetIcon
  let bar = selectors.widgetBar
  let btn = selectors.widgetBtn  
  let collapsible = selectors.collapsible  
  let style = bar.dataset.widgetStyle

  let settings = {
    page: data.settings.dataset.templateName,
    display: data.settings.dataset.barDisplay
  }
  
  if(style == 'icon'){

    switch (status) {      
      case "set":        
        hideElement(bar)
        btn.classList.add("is-open")
        collapsible.classList.add("is-open")
        showElement(icon)
        bar.setAttribute("data-fitment","set")       
        break;      
      case "not set":             
        barDisplaySettings(settings, icon, bar, btn, collapsible)
        break;  
    }
  
    icon.addEventListener("click", (e) => {       
      bar.classList.toggle("hide")    
    });
    
  }
}

function barDisplaySettings(settings, icon, bar, btn, collapsible) {
  let display = settings.display
  let page = settings.page

   if(display == 'true') {
     if(page == 'index'){      
       hideElement(icon)               
       showElement(bar)
     } else {
       hideElement(bar)           
       showElement(icon)
       btn.classList.add("is-open")
       collapsible.classList.add("is-open")
     }
   } else {
     hideElement(icon)           
     showElement(bar)
   }

}

function showElement(el) {
  el.classList.remove("hide")
}

function hideElement(el) {
  el.classList.add("hide")
}

if (data.currentFitment){
  let status = 'set'
  widgetIcon(status)
} else {
  let status = 'not set'
  widgetIcon(status)
}