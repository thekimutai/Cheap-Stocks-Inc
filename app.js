const request = require('request')
const path = require('path')
const csv = require('csv-parser');
global.appRoot = path.resolve(__dirname);
const readline = require('readline');
const fs = require('fs');
const helpMenu = "1. Key in currency code and press enter to check if it is supported.\n2. To show currency country use parameter -c.";

//declare function that gets latest copy of file and accepts user input
const createReadStream = () => {
	var data = [];
	var showCountry = false;
	//get latest file from url provided and read it when done
	request('https://focusmobile-interview-materials.s3.eu-west-3.amazonaws.com/Cheap.Stocks.Internationalization.Currencies.csv').pipe(fs.createWriteStream('Cheap.Stocks.Internationalization.Currencies.csv')).on('finish',() => {
		//read downloaded file
		fs.createReadStream(appRoot+'/Cheap.Stocks.Internationalization.Currencies.csv')
		//parse csv
		.pipe(csv())
		//read data row by row
		.on('data', (row) => {
			//push row object to data array
			data.push(row);
		})
		//file read complete
		.on('end', () => {
			console.log("Type 'Help' or 'h' to see help options");
			// create interface to read input from user
			const rl = readline.createInterface({
			  input: process.stdin,
			  output: process.stdout
			});
			//accept input from user
			rl.question('Currency > ', (input) => {
				//check if they we asking for help
				if(input.match(/help/i)||input.toLowerCase() === 'h'){
					//display help menu
			  		console.log('Help Menu:\n'+helpMenu+'\n');
				}else{
					//split input string to array, helps with paraameters
					chunkedInput = input.split(' ');
					//remove empty elements incase input string had multiple spaces
					chunkedInput = chunkedInput.filter(String);
					//search for currency by ISO in data array
					var currency = data.filter(item => {
						return item['ISO 4217 Code'].toUpperCase() === chunkedInput[0].toUpperCase();
					});
					//check if extra parameters were passed
					if(chunkedInput.length > 1){
						if(chunkedInput[1].replace('-','').toLowerCase() == 'c'){
							showCountry = true;
						}
					}
					//return result
				  console.log(currency.length?'Currency is supported: '+currency[0].Currency+(showCountry?'. Country: '+currency[0].Country:''):'Currency is not yet supported. Type Help if you need help.');
				}
				// close readline createReadStream
			  	rl.close();
			  	//call function again incase user wants to run more queries
			  	createReadStream();
			});
		});
	});
}

//call readstream function to start app
createReadStream();