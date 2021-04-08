const fs = require('fs');
const got = require('got');
const prompts = require('prompts');
const yargs = require('yargs')
const flags = yargs.argv;
const apiKey = 'ee75a1233cd0a33db0f5a09d32fbe7b5'

const questions = [
  {
    type: 'text',
    name: 'city/zipcode',
    message: 'City or not?'
  },
  {
    type: prev => prev == 'city' ? 'text' : null,
    name: 'c',
    message: 'Enter city?'
  },
  {
    type: prev => prev == 'not' ? 'text' : null,
    name: 'z',
    message: 'Enter zipcode/country_code?'
  },
  {
    type: 'text',
    name: 't',
    message: 'C or F?'
  }
];

let cityQuery = `api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
let zipQuery = `api.openweathermap.org/data/2.5/weather?zip=${zipcode}&appid=${apiKey}`

const promptChain = async function(override) {
  // Have additional check to override a question. I need this for the city/zipcode case
  if (override) {
    prompts.override(override);
  } else {
    prompts.override(yargs.argv);
  }
  const response = await prompts(questions);
}

const checkFlags = function() {
  switch (true) {
    case ('import' in flags):
      console.log('Handle batch files');
      break;
    case ('i' in flags):
      console.log('Show last query');
      break;
    case ('t' in flags && ('c' in flags || 'z' in flags)):
      promptChain();
      break;
    case (!('t' in flags) && ('c' in flags || 'z' in flags)):
      promptChain({'city/zipcode': true});
      break;
    case !('c' in flags && 'z' in flags):
      promptChain();
      break;
    default:
      console.log('Enter valid flags or display prompt');
      break;
  }
}

function init() {
  checkFlags();
}

init();