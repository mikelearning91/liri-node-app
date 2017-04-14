// Require all libraries needed for liri to run
var fs = require('fs');
var keys = require('./keys');
var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var clientTwitter = new twitter(keys.twitterKeys);

// Color coding for prompt text
var chalk = require('chalk');

// Get input argument
var selection = process.argv[2];
var type = process.argv.splice(3, process.argv.length - 1).join(' ');

// Log command
logData('', 'white', true);
logData('Command: node liri.js ' + selection + type, 'white', true);

// Run switch cases
switchCases();

// Switch cases for each function (Note: arguments added to handle/resolve parameters)
function switchCases(passSelection, passQuery) {
    if (passSelection !== undefined) {
        selection = passSelection;
    }
    // Switch case to handle input
    switch (selection) {
        case 'my-tweets':
            getTweets(passQuery);
            break;
        case 'spotify-this-song':
            searchSpotify(passQuery);
            break;
        case 'movie-this':
            searchOMDB(passQuery);
            break;
        case 'do-what-it-says':
            randomTxtCommand();
            break;
        case '-h':
            help();
            break;
        default:
            logData('');
            logData('--------------------------------------------------------------------------------', 'yellow');
            logData(' Liri: I am "limited", so to speak. Hence, I did not understand your last input. \r\n Type "node liri.js -h" for help.', 'yellow');
            logData('--------------------------------------------------------------------------------', 'yellow');
    }
}

// Gets 20 most recent tweets
function getTweets() {
    var param = { screen_name: 'nodejs' };
    clientTwitter.get('statuses/user_timeline', param, function(error, tweets, response) {
        if (!error) {
            logData('');
            logData('--------------------------------------------------------------------------------', 'green');
            logData('Liri: Here are your most recent tweets:', 'green');
            logData('--------------------------------------------------------------------------------', 'green');
            for (var i = 0; i < tweets.length; i++) {
                logData('');
                logData('Tweet ' + (i + 1) + ':', 'cyan');
                logData(tweets[i].created_at, 'yellow');
                logData(tweets[i].text);
            }
        } else {
            console.log(error);
        }
    });
}

// Search spotify function
function searchSpotify(passQuery) {
    var param;
    if (passQuery !== undefined) {
        param = { type: 'track', query: passQuery };
    } else if (type === '') {
        param = { type: 'track', query: "what's my age again" };
    } else {
        param = { type: 'track', query: type };
    }
    spotify.search(param, function(err, data) {
        if (err) {
            logData('Error occurred: ' + err);
            return;
        }
        logData('');
        logData('--------------------------------------------------------------------------------', 'green');
        if (type === '') {
            logData('Liri: Here is the spotify search results:', 'green');
        } else {
            logData('Liri: Here is the spotify search results for ' + type + ':', 'green');
        }
        logData('--------------------------------------------------------------------------------', 'green');
        var search = data.tracks.items;
        for (var i = 0; i < search.length; i++) {
            logData('');
            logData('Result ' + (i + 1) + ':', 'green');
            logData('Song title: ' + search[i].name, 'magenta');
            for (var j = 0; j < search[i].artists.length; j++) {
                if (search[i].artists.length === 1) {
                    logData('Artist: ' + search[i].artists[j].name);
                } else {
                    logData('Artist ' + (j + 1) + ': ' + search[i].artists[j].name);
                }
            }
            logData('Album title: ' + search[i].album.name);
            logData('Preview URL: ' + search[i].preview_url);
        }
    });
}

// Request and search OMDB function
function searchOMDB() {
    // if user does not input a movie, this is a list of random movies liri will pick from to show
    var randomMovies = ["Perfect Storm", "Scream", "Mr. Nobody", "Man of Steel"];
    var randomMovie = randomMovies[Math.floor(Math.random() * randomMovies.length)];
    var title;
    if (type === '') {
        title = randomMovie;
    } else {
        title = type;
    }
    var queryURL = 'http://www.omdbapi.com/?t=' + title + '&y=&plot=short&tomatoes=true&r=json';
    request(queryURL, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body, 2, null);
            logData('');
            logData('--------------------------------------------------------------------------------', 'green');
            if (type === '') {
                logData("Liri: You didn't type a movie so I found you one: " + title.toUpperCase(), "green");
                logData('--------------------------------------------------------------------------------', 'green');
                logData('');
                logData('Title: ' + data.Title, 'magenta');
                logData('Year: ' + data.Year);
                logData('IMDB Rating: ' + data.Rated);
                logData('Country: ' + data.Country);
                logData('Language: ' + data.Language);
                logData('Plot: ' + data.Plot);
                logData('Actors: ' + data.Actors);
                logData('Rotten Tomatoes Rating: ' + data.tomatoRating);
                logData('Website: ' + data.Website);
            }
            if (data.Title === undefined) {
                logData("Liri: Sorry, this movie doesn't exist in my database. Please try a different movie.", 'green')
                logData('--------------------------------------------------------------------------------', 'green');

            } else {
                logData('Liri: Here is the OMDB search result for "' + title.toUpperCase() + '": ', 'green');
                logData('--------------------------------------------------------------------------------', 'green');
                logData('');
                logData('Title: ' + data.Title, 'magenta');
                logData('Year: ' + data.Year);
                logData('IMDB Rating: ' + data.Rated);
                logData('Country: ' + data.Country);
                logData('Language: ' + data.Language);
                logData('Plot: ' + data.Plot);
                logData('Actors: ' + data.Actors);
                logData('Rotten Tomatoes Rating: ' + data.tomatoRating);
                logData('Website: ' + data.Website);
            }

        }
    });
}

// Do what it says function
function randomTxtCommand() {
    fs.readFile('random.txt', 'utf8', function(error, data) {
        if (error) {
            logData('Error occurred: ' + error);
            return;
        }
        // Split the text file data/argument by a ,
        var output = data.split(',');
        // Send inputs into cases
        switchCases(output[0], output[1]);
    });
}

// Logs (appends) data to log.txt
function logData(log, color, printer) {
    fs.appendFileSync('log.txt', log + '\r\n');
    if (!printer) {
        if (color !== undefined) {
            console.log(chalk[color](log));
        } else {
            console.log(log);
        }
    }
}

// Help function - users can type "-h" for help on how to use
function help() {
    logData('Usage: node liri.js [arguments]');
    logData('');
    logData('Options:');
    logData('  my-tweets                             show last 20 tweets and when they were created');
    logData("  spotify-this-song '<song name here>'  show the song name, artist(s), album, and preview URL");
    logData("  movie-this '<movie name here>'        show the movie title, year, IMDB rating, country,");
    logData('                                        language, plot and actors');
    logData('  do-what-it-says                       reads random.txt with arguments separated by a comma');
}