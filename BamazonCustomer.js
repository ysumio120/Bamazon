var inquirer = require("inquirer");
var mysql = require("mysql");

var table = [];

var connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'bamazon'
});

connection.connect(function(err) {
	if(err) throw err;
	console.log("connected as id " + connection.threadId);
	display();
});

var display = function() {
	connection.query("SELECT * FROM products", function(err, res) {
		if(err) throw err;
		//console.log(res);
		console.log("\n\nItem ID\t" + " || " + "Product\t" + " || " + "Department\t" + " || " + "Price\t" + " || " + "Quantity");
		console.log("-------------------------------------------------------------------------------------------------------");
		for(var i = 0; i < res.length; i++) {
			console.log(res[i].ItemID + "\t || " + res[i].ProductName + " \t || " + res[i].DepartmentName + "\t || " + res[i].Price + "\t || " + res[i].StockQuantity);
		}
		table = res;
		prompt();
	});
}

var prompt = function() {
	inquirer.prompt([
		{
		name: 'item',
		message: 'What would you like to purchase? (Provide the Item ID)',
		validate: function(value) {
			if(value < 1 || value > table.length) {
				return false;
			}
			return true;
		}
		},
		{
			name: 'quantity',
			message: "How many would like to purchase?",
			validate: function(value) {
				if(Number.isInteger(parseInt(value)) && parseInt(value) >= 0) {
					return true;
				}
				return false;
			}
		}
	]).then(function(answers){
			var itemID = answers.item;
			var quantity = parseInt(answers.quantity);
			var correct = true;
			var currentStock;
			var price;

			for(var i = 0; i < table.length; i++) {
				if(table[i].ItemID == itemID) {
					currentStock = parseInt(table[i].StockQuantity);
					price = parseFloat(table[i].Price);
					if(table[i].StockQuantity < quantity) {
						console.log("Insufficient quantity!");
						correct = false;
						break;
					}
				}
			}
			if(correct) {
				connection.query("UPDATE products SET StockQuantity=? WHERE ItemID=?", [currentStock-quantity, itemID], function(err, res) {
					if(err) throw err;
					console.log("Total Cost: $" + (price * quantity));
				});	
			}
			display();
	})
}