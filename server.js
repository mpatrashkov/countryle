'use strict';

const logo = `
 _______                                   _______                             
(_______)                  _              (_______)                            
 _       ___  _   _ ____ _| |_  ____ _   _ _   ___ _   _ _____  ___  ___  ____ 
| |     / _ \\| | | |  _ (_   _)/ ___) | | | | (_  | | | | ___ |/___)/___)/ ___)
| |____| |_| | |_| | | | || |_| |   | |_| | |___) | |_| | ____|___ |___ | |    
 \\______)___/|____/|_| |_| \\__)_|    \\__  |\\_____/|____/|_____|___/(___/|_|    
                                    (____/                                     
                                     
`;


const chalk = require("chalk");
const chalkAnimation = require("chalk-animation");
const log = console.log;

const countriesLatLon = require("./json/country_latlon.json");
const countriesPopulation = require("./json/country_population.json");
const countriesTemp = require("./json/country_avg_temp.json");
const countriesContinent = require("./json/country_continent.json");
const countriesList = require("./json/country_list.json");

var term = require( 'terminal-kit' ).terminal ;

const winImg = 'win.png'

const rows = [
    [ 'Guesses', 'Country' , 'Hemisphere' , 'Continent', 'Temperature', 'Population', 'Coordinates' ], // HEADER ROW
];

let history = []

const addGuessToTable = (guessCountry, diffs) => {
    term.reset();
    const guessTemp = guessCountry.temperature.toFixed(2);
    const targetTemp = currentCountryData.temperature.toFixed(2);
    const tempArrow = Math.sign(targetTemp - guessTemp);

    const guessPops = (guessCountry.population / 1000000).toFixed(2);
    const targetPops = (currentCountryData.population / 1000000).toFixed(2);
    const popsArrow = Math.sign(targetPops - guessPops);

    if (guessCountry.country === currentCountryData.country) {

        rows.push(
            [
                `^G${guesses}`, `^G${guessCountry.country.toUpperCase()}`, `^G${currentCountryData.hemisphere.toUpperCase()}`, `^G${currentCountryData.continent.toUpperCase()}`, `^G${targetTemp}`, `^G${targetPops}M`, `^G✅`
            ]
        );
    } else {

        rows.push(
            [
                `^R${guesses}`, `^R${guessCountry.country.toUpperCase()}`, `^${diffs.hemisphere ? "G" : "R"}${guessCountry.hemisphere.toUpperCase()}`, `^${diffs.continent ? "G" : "R"}${guessCountry.continent.toUpperCase()}`,
                `^${diffs.temperature}${parseArrowEmoji(tempArrow)} ${guessTemp}`, `^${diffs.population}${parseArrowEmoji(popsArrow)} ${guessPops}M`, `^B${parseDirectionToEmoji(diffs.direction)} ${diffs.direction}`
            ]
        );
    }
    term.table(rows, tableOptions);
}

let guesses = 0;
let currentCountryData = {
    country: "",
    continent: "",
    lat: 0,
    lon: 0,
    population: 0,
    hemisphere: "",
    temperature: 0,
}


const tableOptions = {
    hasBorder: true,
    contentHasMarkup: true,
    borderChars: 'lightRounded' ,
    borderAttr: { color: 'yellow' } ,
    textAttr: { bgColor: 'default' } ,
    firstCellTextAttr: { color: 'blue' } ,
    firstRowTextAttr: { color: 'yellow' } ,
    // firstColumnTextAttr: { bgColor: 'red' } ,
    width: 110,
    fit: true,
};

const parseDirectionToEmoji = (direction) => {
    switch(direction) {
        case "N":
            return "⬆";
        case "S":
            return "⬇";
        case "E":
            return "⮕";
        case "W":
            return "⬅";
        case "NE":
            return "↗";
        case "NW":
            return "↖";
        case "SE":
            return "↘";
        case "SW":
            return "↙";
        default:
            return "?";
    }
}

const parseArrowEmoji = (sign) => {
    if (sign === 0) return "";
    return sign > 0 ? "⬆" : "⬇";
}

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
};

const allCountriesAsArray = () => {
    return [...countriesList.map(country => country.country)];
};

const populateCountryData = (country) => {
    let countryData = { ...currentCountryData };
    if (!allCountriesAsArray().includes(country)) return undefined;
    const { lat, lon } = getCountryAverageLatLon(country);
    countryData.country = country;
    countryData.lat = lat;
    countryData.lon = lon;
    countryData.continent = getCountryContinent(country);
    countryData.population = getCountryPopulation(country);
    countryData.hemisphere = lat >= 0 ? "northern" : "southern";
    countryData.temperature = getCountryAverageTemp(country);
    return countryData;
};

const getCountryContinent = (countryName = "") => {
    const country = countriesContinent.filter(cc => cc.country === countryName)[0];
    if (country) {
        return country.continent;
    }
    return undefined;
}

const getCountryAverageLatLon = (countryName = "") => {
    const country = countriesLatLon.filter(cll => cll.country === countryName)[0];
    if (country) {
        if (country.east === null && country.west !== null) country.east = country.west;
        if (country.west === null && country.east !== null) country.west = country.east;
        if (country.south === null && country.north !== null) country.south = country.north;
        if (country.north === null && country.south !== null) country.north = country.south;
        const lon = (country.east + country.west) / 2;
        const lat = (country.south + country.north) / 2;
        return { lat, lon };
    }
    return undefined;
};

const getCountryPopulation = (countryName = "") => {
    const country = countriesPopulation.filter(cp => cp.country === countryName)[0];
    if (country) {
        return country.population;
    }
    return undefined;
};

const getCountryAverageTemp = (countryName = "") => {
    const country = countriesTemp.filter(ct => ct.country === countryName)[0];
    if (country) {
        return country.temperature;
    }
    return undefined;
};

const pickRandomCountry = () => {
    return countriesList.random().country;
};


const toRadians = (degrees) => degrees * Math.PI / 180;
   
const toDegrees = (radians) => radians * 180 / Math.PI;
  
const bearing = (guessCountry) => {
    let { lat:startLat, lon:startLng } = guessCountry;
    let { lat:destLat, lon:destLng } = currentCountryData;

    startLat = toRadians(startLat);
    startLng = toRadians(startLng);
    destLat = toRadians(destLat);
    destLng = toRadians(destLng);

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = toDegrees(brng);
    brng = (brng + 360) % 360
    console.log("Bearing is", brng);
    const between = (f, t) => brng >= f && brng <= t

    if (between(0, 10) || between(350, 360)) return "N";
    if (between(10, 80)) return "NE";
    if (between(80, 100)) return "E";
    if (between(100, 170)) return "SE";
    if (between(170, 190)) return "S";
    if (between(190, 260)) return "SW";
    if (between(260, 280)) return "W";
    if (between(280, 350)) return "NW";

}

const startGuess = () => {
    term('Enter your guess (Tab for autocomplete) > ')
    term.inputField(
        { history: history, autoComplete: allCountriesAsArray(), autoCompleteMenu: true } ,
        ( error , country ) => {
            if (country === "exit") return term.processExit(0)
            const guessData = populateCountryData(country)
            if (guessData) {
                if (history.includes(country)) {
                    term.red(`\n\n${country} was already guessed.\n\n`);
                    return startGuess();
                } else {
                    history.push(country);
                }
                const tempDiff = currentCountryData.temperature - guessData.temperature;
                const popsDiff = (currentCountryData.population / 1000000) - (guessData.population / 1000000);
    
                const diffs = {
                    hemisphere: guessData.hemisphere === currentCountryData.hemisphere,
                    continent: guessData.continent === currentCountryData.continent,
                    population: Math.abs(popsDiff) <= 1 ? "G" : "R",
                    temperature: Math.abs(tempDiff) <= 0.5 ? "G" : Math.abs(tempDiff) <= 1.5 ? "Y" : "R",
                    continent: guessData.continent === currentCountryData.continent,
                    direction: bearing(guessData),
                }
                guesses++;
                addGuessToTable(guessData, diffs);
                if (guessData.country === currentCountryData.country) {
                    
                    term.slowTyping(
                        'YOU WIN!\t\t\tYOU WIN!\n\tYOU WIN!\tYOU WIN!\n\t\tYOU WIN!\n' ,
                        { flashStyle: term.brightWhite, delay: 50 } ,
                        () => term.processExit(0)
                    );
                }
                else {
                    return startGuess();
                }
            }
            else {
                term.red("\n\nThis is not a valid country!\n\n");
                return startGuess();
            }
        }
    ) ;
}

const main = () => {
    term.reset();
    let animation = null;
    animation = chalkAnimation.rainbow(logo, 3);
    setTimeout(() => {
        animation = chalkAnimation.karaoke(`                      
|   _  _  _|. _  _          
|__(_)(_|(_||| )(_).  .  .  
                _/          


                `
    , 2);
    }, Math.random() * 500 + 1000);
    setTimeout(() => {
        const country = pickRandomCountry();
        // const country = "Bulgaria";
        currentCountryData = populateCountryData(country);
        animation.stop();
        term.green("\nThe game is ready to play!\n");
        startGuess();
    }, 2000 + Math.random() * 500);
};

main();