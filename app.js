const fsPromises = require("fs").promises;
const os = require('os');
const got = require("got");
const prompts = require("prompts");
const yargs = require("yargs");
// open weather app api key for testing purposes
const apiKey = "ee75a1233cd0a33db0f5a09d32fbe7b5";

let paramsObject = {
  "city/zipcode": null,
  c: null,
  z: null,
  t: null
}

const resetParams = async function() {
  paramsObject = {
    "city/zipcode": null,
    c: null,
    z: null,
    t: null
  }
}

const saveConfig = async function(showMsg = true) {
  const data = JSON.stringify(paramsObject);

  try {
    const res = await fsPromises.writeFile(`${os.homedir}/config.json`, data);
    if (showMsg) {
      console.log('Configuration saved successfully. Use -i to get the weather for you last search.');
    }
  } catch (e) {
    console.log('There has been an error saving your configuration data.\n');
    console.error(e.message);
  }
}

const readConfig = async function() {
  const data = await fsPromises.readFile(`${os.homedir}/config.json`);
  let myObj;

  try {
    myObj = JSON.parse(data);
    paramsObject = myObj;
  } catch (e) {
    console.log('There has been an error parsing your JSON.')
    console.log(e);
  }
}

const updateParams = async function(params, showMsg = true, save = true) {
  paramsObject = { ...paramsObject, ...params };
  paramsObject.city !== null ? paramsObject["city/zipcode"] = 'city' : 'not';
  if (save) {
    await saveConfig(showMsg);
  }
}

const importFile = async function(path) {
  let lines = await fsPromises.readFile(path, 'utf-8');
  let parsed = JSON.parse(lines);

  if (parsed.length <= 10) {
    for (const line of parsed) {
      await updateParams(line, false, false);
      await fetchData();
    }
  } else {
    console.log("Maximum import of 10 cities.")
  }
}

const questions = [
  {
    type: "text",
    name: "city/zipcode",
    message: "City or not?",
    initial: 'city',
    validate: (value) => {
      if (!value  && value !== 'city' && value !== 'not') {
        return 'Invalid option';
      }

      return true;
    }
  },
  {
    type: (prev) => (prev === "city" ? "text" : null),
    name: "c",
    message: "Enter city?",
    validate: (value) => {
      if (!value && value === '') {
        return 'Please enter a city';
      }

      return true;
    }
  },
  {
    type: (prev) => (prev === "not" ? "text" : null),
    name: "z",
    message: "Enter zipcode,country_code?",
    validate: (value) => {
      if (!value && value === '') {
        return 'Please enter a zipcode,country_code';
      }

      return true;
    }
  },
  {
    type: "text",
    name: "t",
    message: "C or F?",
    validate: (value) => {
      if (!value && value === '') {
        return 'Please enter a preference';
      }

      return true;
    }
  },
];

const fetchData = async function () {
  let type = "q";
  let units = "metric";
  let params = paramsObject["c"];
  let responseCli = "";

  if (paramsObject.z !== null) {
    type = "zip";
    params = paramsObject["z"];
  }
  // if somehow temperature flag is missing a value, default to metric units
  if (paramsObject["t"] !== true && paramsObject["t"].toLowerCase() == "f") {
    units = "imperial";
  }
  let query = `https://api.openweathermap.org/data/2.5/weather?${type}=${params}&appid=${apiKey}&units=${units}`;

  try {
    const response = await got(query);
    const data = JSON.parse(response.body);
    responseCli = `The temperature in ${data.name} is ${data.main.temp}, humidity is ${data.main.humidity}, and it's ${data.weather[0].description}.`;
    // Print out the response
    console.log(responseCli);
    await resetParams();
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
  const flags = yargs.argv;
  let prompts = null;

  if (flags.c || flags.z || flags.t || flags.i || flags.import) {
    switch (true) {
      // import batch
      case "import" in flags:
        importFile(flags.import);
        break;
      // use last query
      case "i" in flags:
        await readConfig();
        await fetchData();
      break;
      // all flags passed correctly
      case "t" in flags && ("c" in flags || "z" in flags):
        updateParams(flags);
        await fetchData();
        break;
      // temperature flag missing
      case !("t" in flags) && ("c" in flags || "z" in flags):
        updateParams(flags, false);
        prompts = await promptChain({"city/zipcode": true});
        updateParams(prompts);
        await fetchData();
        break;
      // city/zipcode missing
      case !("c" in flags && "z" in flags):
        updateParams(flags, false);
        prompts = await promptChain();
        updateParams(prompts);
        await fetchData();
        break;
      default:
        console.log("Enter valid flags or display prompt");
        break;
    }
  } else {
    updateParams(await promptChain());
    await fetchData();
  }
};

function init() {
  checkFlags();
}

init();