# Open Weather CLI app

This is a CLI app that fetches live data from OpenWeather(https://openweathermap.org).

## Installation
**Requirements**: Node **v.12** or greater.

*Step 1*. Clone or download the repository.\
*Step 2*. Navigate to the repository in the terminal and run `npm install`.\
*Step 3*. To run, execute `node app.js`.

## Usage
You can run `node app.js` and follow the prompt questions, or you can use the following flags:

`-c` : *city*\
`-z` : *zipcode*\
`-t` : *temperature unit*\
`-i` : *get data from the last input*\
`--import`: *import batch file*

ex\:
```node app.js -c Skopje - t C```

*Note*: If there is a flag missing, you will be prompted to enter additional info.

**Importing files**
The file has to be in `.json`, and contain the same flags as mentioned above. 
You can look at the [example](https://github.com/BStojanoska/weather-app/blob/master/batchImport.json) batch file.