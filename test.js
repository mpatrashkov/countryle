const countriesList = require("./json/country_list.json");
const readline = require("readline");

const allCountriesAsArray = () => {
    return [... countriesList.map(country => country.country)];
}

const completer = (line) => {
    const completions = allCountriesAsArray();
    var hits = completions.filter(function(c) {
        if (c.indexOf(line) == 0) {
          // console.log('bang! ' + c);
          return c;
        }
    });
    return [hits && hits.length ? hits : completions, line];
}

const rl = readline.createInterface(process.stdin, process.stdout, completer);

rl.question("Vavedi nqkaw 4ep: ", () => {
    console.log("!");
})