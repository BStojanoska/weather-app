const fs = require("fs");
const got = require("got");
const prompts = require("prompts");
const yargs = require("yargs");
const flags = yargs.argv;
const apiKey = "ee75a1233cd0a33db0f5a09d32fbe7b5";

const questions = [
  {
    type: "text",
    name: "city/zipcode",
    message: "City or not?",
    initial: 'city',
    validate: value => !(value.toLowerCase() == 'city' || value.toLowerCase() == 'not') ? 'Invalid option' : true
  },
  {
    type: (prev) => (prev.toLowerCase() == "city" ? "text" : null),
    name: "q",
    message: "Enter city?",
  },
  {
    type: (prev) => (prev == "not" ? "text" : null),
    name: "zip",
    message: "Enter zipcode/country_code?",
  },
  {
    type: "text",
    name: "t",
    message: "C or F?",
    validate: value => !(value.toLowerCase() == 'c' || value.toLowerCase() == 'f') ? 'Invalid option' : true
  },
];

const fetchData = async function (flags) {
  let type = "q";
  let units = "metric"
  if ("zip" in flags) {
    type = "zip";
  }
  if (flags["t"].toLowerCase() == "f") {
    units = "imperial";
  }
  let params = flags[type];
  let query = `https://api.openweathermap.org/data/2.5/weather?${type}=${params}&appid=${apiKey}&units=${units}`;

  try {
    const response = await got(query);
    const data = JSON.parse(response.body);
    let responseCli = `The temperature in ${data.name} is ${data.main.temp}, humidity is ${data.main.humidity}, and it's ${data.weather[0].description}.`
    console.log(responseCli);

  } catch (error) {
    console.log(error.response.body);
  }
};

const promptChain = async function (override) {
  // Have additional check to override a question. I need this for the city/zipcode case
  if (override) {
    prompts.override(override);
  } else {
    prompts.override(yargs.argv);
  }
  return prompts(questions);
};

const checkFlags = async function () {
  if (flags.argv) {
    switch (true) {
      case "import" in flags:
        console.log("Handle batch files");
        break;
      case "i" in flags:
        console.log("Show last query");
        break;
      case "t" in flags && ("c" in flags || "z" in flags):
        promptChain();
        fetchData(flags);
        break;
      case !("t" in flags) && ("c" in flags || "z" in flags):
        promptChain({ "city/zipcode": true });
        break;
      case !("c" in flags && "z" in flags):
        promptChain();
        break;
      default:
        console.log("Enter valid flags or display prompt");
        break;
    }
  } else {
    const prompts = await promptChain();
    const result = await fetchData(prompts);
  }
};

function init() {
  checkFlags();
}

init();