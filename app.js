/*
Basic overview:

Modules:
UI Module

budget user interface updated
data added to the user interface

Data Module
input data retrieved
data added to data structure
budget is updated (calculated)

Controller Module
Add button is clicked - event handler
*/
let calculationController = (function() {
	// Code
	let Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	let Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.expensePercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	let calculateTotal = function(type) {
		let sum = 0;
		data.dataBase[type].forEach(function(i) {
			sum += i.value;
		});
		data.totalDB[type] = sum;
	};
	// App data
	let data = {
		dataBase: {
			inc: [],
			exp: []
		},
		totalDB: {
			inc: 0,
			exp: 0
		},
		budget    : 0,
		percentage: -1
	};
	return {
		addItem: function(type, desc, val) {
			let newItem, id;
			if (data.dataBase[type].length > 0) {
				id = data.dataBase[type][data.dataBase[type].length - 1].id + 1;
			} else {
				id = 0;
			}
			if (type === 'inc') {
				newItem = new Income(id, desc, val);
			} else if (type === 'exp') {
				newItem = new Expense(id, desc, val);
			}
			data.dataBase[type].push(newItem);
			return newItem;
		},
		deleteItem: function(type, id) {
			let ids, index;
			// Map function will return a new (copied) array 
			ids = data.dataBase[type].map(function(current) {
				// Returns all the id property of all the indexes in the array (may not be [1,2,3,4,5] - possibly [1,3,4,6,7,8])
				return current.id;
			});
			// If id is found in the new mapped array, set it to index (-1 if not found)
			index = ids.indexOf(id);
			if (index !== -1) {
				// Splice will remove array index at specified index for count (1 in this case)
				data.dataBase[type].splice(index, 1);
			}
		},
		updateBudget: function() {
			calculateTotal('inc');
			calculateTotal('exp');
			data.budget = data.totalDB.inc - data.totalDB.exp;
			if (data.totalDB.inc > 0) {
				data.percentage = Math.round((data.totalDB.exp / data.totalDB.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		updatePercentages: function() {
			data.dataBase.exp.forEach(function(cur) {
				// The expensePercentage function was added to the Expense prototype
				cur.expensePercentage(data.totalDB.inc);
			});
		},
		getPercentages: function() {
			let allPerc = data.dataBase.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},
		getBudget: function() {
			return {
				budget    : data.budget,
				percentage: data.percentage,
				totalInc  : data.totalDB.inc,
				totalExp  : data.totalDB.exp
			};
		}
	};
})();

let UIcontroller = (function() {
	// Code
	let DOM = {
		type           : '.add__type',
		desc           : '.add__description',
		val            : '.add__value',
		inputBtn       : '.add__btn',
		contIncome     : '.income__list',
		contExpense    : '.expenses__list',
		budgetLabel    : '.budget__value',
		incomeLabel    : '.budget__income--value',
		expenseLabel   : '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container      : '.container',
		expPerc        : '.item__percentage',
		month          : '.budget__title--month'
	};
	let formatNumber = function(num, type) {
		let numSplit, int, dec;
		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		dec = numSplit[1];
		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};
	return {
		getData: function() {
			return {
				type       : document.querySelector(DOM.type).value,
				description: document.querySelector(DOM.desc).value,
				value      : parseFloat(document.querySelector(DOM.val).value)
			};
		},

		addToList: function(obj, type) {
			let html, htmlNew, element;
			if (type === 'inc') {
				element = DOM.contIncome;
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOM.contExpense;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			// Searches for the id's in the html code and replaces the tags with the values from the new object.
			htmlNew = html.replace('%id%', obj.id);
			htmlNew = htmlNew.replace('%description%', obj.description);
			htmlNew = htmlNew.replace('%value%', formatNumber(obj.value, type));
			// Get the element which needs to be replaced
			document.querySelector(element).insertAdjacentHTML('beforeend', htmlNew);
		},

		clearInput: function() {
			let fields, fieldsArr;
			fields = document.querySelectorAll(DOM.desc + ', ' + DOM.val);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, arry) {
				current.value = '';
			});
			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			let type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOM.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOM.incomeLabel).textContent = formatNumber(obj.totalInc, 'int');
			document.querySelector(DOM.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOM.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOM.percentageLabel).textContent = '-';
			}
		},

		displayPercentages: function(percentages) {
			let fields = document.querySelectorAll(DOM.expPerc);

			let nodeListForEach = function(list, callback) {
				for (let i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			};

			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '-';
				}
			});
		},
		changeType: function() {
			let fields = document.querySelectorAll(DOM.type + ',' + DOM.desc + ',' + DOM.value);
			nodeListForEach
			;
			(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});
		},
		deleteListItem: function(listItem) {
			let parentID;
			// DOM item cannot be directly deleted only a child of a specified element.
			// So first the item is specified by id and then .parentNode of that item.
			// Then the removeChild is specified and the item is passed as the child to be removed
			parentID = document.getElementById(listItem);
			parentID.parentNode.removeChild(parentID);
		},
		// Exposes the DOM variable to global
		globalDOM: function() {
			return DOM;
		}
	};
}());

let masterController = (function(calcControl, UIcontrol) {

	// Start all event listeners
	let DOM = UIcontrol.globalDOM();

	function setUpEventListeners() {
		document.querySelector(DOM.inputBtn).addEventListener('click', addData);
		document.addEventListener('keydown', function(event) {
			if (event.keyCode === 13 || event.which === 13) { // Which is for older browsers
				addData();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.type).addEventListener('change', UIcontrol.changeType);
	}

	let requestBudget = function() {
		calcControl.updateBudget();
		let budget = calcControl.getBudget();
		console.log(budget);
		UIcontrol.displayBudget(budget);
	};

	let updatePercentages = function() {
		calcControl.updatePercentages();
		let percentages = calcControl.getPercentages();
		UIcontrol.displayPercentages(percentages);
	};

	let ctrlDeleteItem = function(event) {
		let itemID, splitID, type, id;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			id = parseInt(splitID[1]);
			calcControl.deleteItem(type, id);
			UIcontrol.deleteListItem(itemID);
			requestBudget();
			updatePercentages();
		}
	};

	function addData() {
		let input, newItem;
		input = UIcontrol.getData();
		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			newItem = calcControl.addItem(input.type, input.description, input.value);
			UIcontrol.addToList(newItem, input.type);
			UIcontrol.clearInput();
			requestBudget();
			updatePercentages();
		} else {
			console.log('there was a problem with your input.');
		}
	}

	function displayMonth() {
		let date, month, months;
		date = new Date();
		month = date.getMonth();
		months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		year = date.getFullYear();
		document.querySelector(DOM.month).textContent = months[month] + ' ' + year;
	}

	// MasterController return functions
	return {
		init: function() {
			console.log('Starting Up!');
			setUpEventListeners();
			displayMonth();
			UIcontrol.displayBudget({
				budget    : 0,
				percentage: 0,
				totalInc  : 0,
				totalExp  : 0
			});
		}
	};
}(calculationController, UIcontroller));

masterController.init();