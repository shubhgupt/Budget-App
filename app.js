
// BUDGET CONTROLLER
var budgetController = (function(){
    var Income = function(id,description,value){
      this.id = id;
      this.description = description;
      this.value = value;
    };
    
    var Expense = function(id,description,value){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };
    
    Expense.prototype.calcPercentages = function(totalIncome){
        if(totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome)*100);
        else 
            this.percentage = -1;
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    var calculateTotals = function(type){
        var total=0;
        data.allItems[type].forEach(function(current){
                total += current.value ; 
            });
        data.totals[type] = total;    
    };
    var data = {
        allItems : {
            inc : [],
            exp : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };
    
    return {
        addItem : function(type,des,val){
            var newItem, ID;
            
            //[1 2 3 4 5] ID = array length + 1
            //[1 2 4 6 8] ID = lastelementID + 1
            
            // New ID generation
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            // Create new item based on type of item
            if( type === "inc"){
                newItem = new Income(ID,des,val);
            }else {
                newItem = new Expense(ID,des,val);
            }
            
            // Adding new item in data structure
            data.allItems[type].push(newItem);
            
            // returning added Item
            return newItem;
        },
        calculateBudget : function(){
            
            // calculate the total Income and Expenses
            calculateTotals("inc");
            calculateTotals("exp");
            
            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we expent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }
        },
        calculatePercentages : function(){
            data.allItems['exp'].forEach(function(current){
               current.calcPercentages(data.totals['inc']); 
            });
            
        },
        getPercentages : function(){
            var allper = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allper;
        },
        deleteItem : function(type,id){
            var index,ids;
            // id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8]
            // index = 3
            
            // map method is same as forEach but it returns an array of same size and having values that we returned from
            // a callback function
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            if(index !== -1){
                //splice method is used to delete elements of an array first argument is starting index and the second
                // one is no. of elements we want to delete starting from the given index.
                data.allItems[type].splice(index,1);
            }
        },
        getBudget : function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        },
        testing : function(){
            console.log(data);
        }
        
    };
})();

// UI CONTROLLER
var UIController = (function(){
    
    // We are creating this object to store all the class names present in our document so that if in future we have made
    // changes to the classes name in HTML then we don't have to make change everywhere in our JS file also we Have to 
    // make changes in DOMstrings object only.
    var DOMstrings = {
      inputType : '.add__type',
      inputDescription : '.add__description',
      inputValue : '.add__value',
      inputBtn : '.add__btn',
      incomeContainer : '.income__list',
      expensesContainer : '.expenses__list',
      budgetLabel : '.budget__value',
      incomeLabel : '.budget__income--value',
      expensesLabel : '.budget__expenses--value',
      percentageLabel : '.budget__expenses--percentage',
      container: '.container',
      expensesPerLabel: '.item__percentage',
      dateLabel : '.budget__title--month'
    };
    var formatNumber = function(num, type){
        
        var numSplit,int,dec,sign;
          /**
           * + or - before number
           * exactly 2 decimal points
           * comma separating the thousands
           * 
           * e.g. 2340.4587 -> 2,340.46
           * e.g. 2000 -> 2,000.00
           */
          
          // this method removes any sign present before a number
          num = Math.abs(num);
          
          // this method is to round any number upto the decimal places we want and it returns a string
          num = num.toFixed(2);
          
          numSplit = num.split('.');
          int = numSplit[0];
          if(int.length > 3){
              int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , 3);
          }
          
          dec = numSplit[1];
          
          type === 'exp' ? sign = '-' : sign = '+';
          
          return sign + ' ' + int +'.' + dec;
      };
      var allNodesForEach = function(list, callBack ){
                for(var i=0; i< list.length; i++){
                    callBack(list[i],i);
                }
        };
      
    // As this method is going to be called from outside the module we have to make it public.
    return {
      getInput : function(){
          // WE are returning object from here so that all these three values can be easily accessible from outside.
          return {
             type : document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
             description : document.querySelector(DOMstrings.inputDescription).value,
             value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
          };
          
      },  
      addItem : function(obj,type){
          var html,newHtml,container;
          // WE have to create HTML strings with placeholder values
          if(type === "inc"){
              container = DOMstrings.incomeContainer;
              html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          }else {
              container = DOMstrings.expensesContainer;
              // To read this string go to html page it is written there in comments.
              html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          }
          // Then we should replace the placeholder value with the data present in our object
          newHtml = html.replace('%id%',obj.id);
          newHtml = newHtml.replace('%description%',obj.description);
          newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
          
          // put our Html string in DOM.
          document.querySelector(container).insertAdjacentHTML('beforeend',newHtml);
      },
      deleteItem : function(selectorId){
            var el = document.getElementById(selectorId);
            // In JS we can not delete any element directly we can only delete a child element
            el.parentNode.removeChild(el);
      },
      clearFields: function(){
            var fields,fieldsArr;
            
            // this querySelctorAll method returns a list of values not in the form of array so we have to convert this
            // list into an array type
            fields  = document.querySelectorAll(DOMstrings.inputDescription +', ' + DOMstrings.inputValue);
            
            // To convert this list into an array we can use array slice method but we can't call it directly for fields
            // as it is a list therefore we have to use call method and pass fields  to the this variable of slice
            fieldsArr = Array.prototype.slice.call(fields);
            
            // forEach method uses a call back functiono which is going to be called for every value of the array and
            // there are three arguments which are passed by default i)Current value , ii) index , iii) entire array
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            // this is to set focus back to the first field
            fieldsArr[0].focus();
      },
      displayBudget: function(obj){
          var type;
          obj.budget >= 0 ? type = 'inc' : type = 'exp';
          document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type) ;
          document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
          document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
          
          if(obj.percentage > 0){
              document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
          }else{
              document.querySelector(DOMstrings.percentageLabel).textContent = '---';
          }
          
      },
      displayPercentages : function(percentages){
            
            var allNodes = document.querySelectorAll(DOMstrings.expensesPerLabel);
            
            
            allNodesForEach(allNodes, function(current,index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '--';
            });
      },
      displayDate : function(){
            var now, year,month;
            
            now = new Date();
            
            month = ['January','Fabruary', 'March', 'April', 'May','June','July','August','September','October','November','December'];
            year = now.getFullYear();
            
            month = month[now.getMonth()];
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' +year;
            
      },
      changedType : function(){
        
          var fields = document.querySelectorAll(
                  DOMstrings.inputType + ', ' +
                  DOMstrings.inputDescription + ', ' +
                  DOMstrings.inputValue
                  );
          
          allNodesForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
          document.querySelector(DOMstrings.inputBtn).classList.toggle('red');  
      },
      getDOMstrings : function(){
        return DOMstrings;  
      }
    };
})();

// WE can also use the budgetController and UIController in our Controller module directly as they are defined in a global 
// Scope but it's not a best practice because if in future we want to change the name of our module then we have to do it 
// everywhere in our Controller module but now we have to change it in our argument list only...

// GLOBAL CONTROLLER
var Controller = (function(budgetCtrl,UICtrl){
    
    
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
      
        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the Budget
        var budget = budgetCtrl.getBudget();
       
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    var updatePercentages = function(){
       
        //1. Calculate the Percentages
        budgetCtrl.calculatePercentages();
        
        // 2. REad percentages from the Budget Controller
        var allPercentages  = budgetCtrl.getPercentages();
        
        // 3. Update teh UI with the new percentages
        UICtrl.displayPercentages(allPercentages);
    };
    var ctrlAddItem = function(){
        var input,newItem;
        
        //1. Get the input field data
       input = UICtrl.getInput();
       
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addItem(newItem, input.type);

            // 4. Clear the Fields
            UICtrl.clearFields();

            //5. Calculate and Update the budget
            updateBudget();
            
            //6. Calculate and Update Percentages
            updatePercentages();

        }
        
    };
    
    var ctrlDeleteItem = function(event){
        var itemId,splitId,type,id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            
            // 1. Delete the item from our Data Structure
            budgetCtrl.deleteItem(type,id);
            
            // 2. Delete the item from the UI
            UICtrl.deleteItem(itemId);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and Update Percentages
            updatePercentages();
        }
    };
    return {
        init: function(){
            console.log("Application has started!");
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp : 0,
                percentage : -1
            });
            UICtrl.displayDate();
        }
    };
    
          
   
})(budgetController,UIController);

Controller.init();