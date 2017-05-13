// TBD
//const SheetNotFoundError = require('../../src/exceptions/sheetNotFoundError');
//const ExceptionMessages = require('./exceptionMessages'); https://trello.com/b/UfVop3Qa

const TrelloHelper = function () {
    var self = {};
    var trello_board_url = '/b/UfVop3Qa';
    
    var global_cards = [];
    var global_lists = [];
    var global_labels = [];
    var all = [];
    
    
    self.init = function(){
        console.log("TrelloHelper init");
        return self;

    };
    
    self.getAll = function() {
        console.log("TrelloHelper getAll : " +all);
        return all;
    };
    
    self.build = function () {
        
        /*var global_cards = [];
        var global_lists = [];
        var global_labels = [];
        this.all = [];*/
    
        console.log("TrelloHelper build");
        trelloGO();
        
        setTimeout(function(){
            compute_to_all();
        }, 5000);

        
        //compute_to_all();
        
        function success(successMsg) {
          console.log("successMsg"+successMsg);
        };
        
        function error(errorMsg) {
          console.log("errorMsg "+ errorMsg);
        };
        
         /* OLDDD 
        function loadedLists(lists) {
        	try{
        	    console.log("loadedLists " + lists.length);
            	//# Only the 4 first to get the Stages
            	lists.splice(4, lists.length-1);
		        global_lists = lists;
		        console.log(global_lists);
        	} catch (exception) {
                console.log(exception);
            }
        }; */
        
        function loadedCards(cards) {
            try {
            	//console.log("loadedCards " + cards);
            	global_cards = cards;
            	console.log(global_cards);
            } catch (exception) {
                console.log(exception);
            }
        	
        };
        
        function loadedLabels(labels) {
            try {
            	//console.log("loadedLabelss " + labels);
            	//# Only the 4 first to get the Quadrants
            	labels.splice(4, labels.length-1);
            	global_labels = labels;
            	console.log(global_labels);
            } catch (exception) {
                console.log(exception);
            }
        };
        
        
        function loadedLists(lists) {
            try {
            	//console.log("loadedLabelss " + lists);
            	//# Only the 4 first to get the Quadrants
            	lists.splice(4, lists.length-1);
            	global_lists = lists;
            	console.log(global_lists);
            } catch (exception) {
                console.log(exception);
            }
        };
        
        /* OLDDD 
        function loadLists() {
              console.log("entering loadList");
              Trello.rest(
                    "GET",
        	        trello_board_url+'/lists',
        	        { fields: "id" },
		            loadedLists,
        	        success("list"),
        			error ("list")
              );
        }; */
        
        function loadLists() {
              console.log("entering loadTest");
              Trello.get(
        	        trello_board_url+'/lists',
        	        loadedLists,
        	        success(" test "),
        			error
              );
        };
        
        function loadCards() {
              console.log("entering loadCards");
              Trello.get(
        	        trello_board_url+'/cards',
        	        { filter: "open" },
        	        loadedCards,
        	        success("  cards OK"),
        			error
              );
        };
        
        function loadLabels() {
              console.log("entering loadLabels");
              Trello.get(
        	        trello_board_url+'/labels',
        	        loadedLabels,
        	        success("    loadl OK"),
        			error
              );
        };
        
        // Check if the given ID in is : can be used for Labels and Lists
        function isIn(id,tab){
        	//console.log("entering is in label " + id);
        	//console.log(tab_list.length);
        	var i = 0;
        	for (var index in tab){
        		//console.log(tab[index].id);
        		if (id == tab[index].id) {
        			//console.log(tab[index].name);
        			i++;
        		}
        		else {
        		//	console.log("false");
        		}
        	}
        	
        	if(i == 0){
        		return false;
        	} 
        	else {
        		return true;
        	}
        };
    
        // Get name if the given ID : can be used for Labels and Lists
        function nameOf(id,list){
        	for (var index in list){
        		//console.log(tab_list[index].id);
        		if (id == list[index].id) {
        			return list[index].name;
        		}
        		else {
        		//	TBD
        		}
        	}
        };
    
        function compute_to_all(){
                	//***-------------------------------------------------------------------------------------------------------------------------------**//
    	//*** uses Trello Data to create the right data set for though work quadrant, such as
    	/***  var all = [ { name: "Charlie", ring: "adopt", quadrant: "Unicorn", isNew: "TRUE", description: "yolo" }, 
                            { name: "Chaaaa", ring: "adopt", quadrant: "Unicorn2", isNew: "TRUE", description: "yolo2" }, 
                            { name: "The non beliver", ring: "ringolo", quadrant: "Unicorn3", isNew: "TRUE", description: "yolo3" }, 
                            { name: "The Unicorn", ring: "ringTest", quadrant: "Magic Trees", isNew: "FALSE", description: "Adequate" }
                        ];
        */
        //***-------------------------------------------------------------------------------------------------------------------------------**//
        // PAs de gestion des cartes à plusieurs Labels pour l'instant, on prend le premier par defaut
        //***-------------------------------------------------------------------------------------------------------------------------------**//
             try{
                 console.log(global_cards);
                 console.log("entering compute to all");
            	 console.log(global_cards.length);
                 // For each card
                 for (var index in global_cards){
                    //console.log("compute index "+index);
                 	// Check if we take it
            		// if idList is not in the shorten IdList, do not take into account the element
            		// if first element of idLabel is not in the shorten IdLabel[], do not take into account the element
            		//console.log(index + " " + global_cards[index].idList);
            		if(isIn(global_cards[index].idList,global_lists) && (global_cards[index].idLabels.length !=0) && isIn(global_cards[index].idLabels[0],global_labels)){
            		//console.log("succed is in list");
        	        	// Create a new element in all 
        	        	console.log("compute all.push ");
        	        	all.push({
        	        		// With name as the name card
        	        		"name": global_cards[index].name,
        	        		// With ring as the name of its idList
        	        			// if idList is not in the shorten IdList, do not take into account the element
        	        		//"ring": cards[index].name,
        	        		"ring": nameOf(global_cards[index].idList,global_lists),
        	        		// With quandrant as the name of the first element of its idLabel[]
        	        			// if first element of idLabel is not in the shorten IdLabel[], do not take into account the element
        	        		"quadrant": nameOf(global_cards[index].idLabels[0],global_labels),
        	        		// with isNew at TRUE value by default
        	        		"isNews" : "FALSE",
        	        		// with description as the desc of the card
        	        		"description": global_cards[index].desc
        	        	});
            		}
        	
                 }
                 
                 console.log("this is all " + all);

            } catch (exception) {
                console.log(exception);
            }

         };
    
        function authenticationFailure() { 
        	console.log("Failed authentication"); 
        };
        
        function authenticationSuccess() {
        	console.log("authenticationSuccess");

        	try {
            	
            	loadCards();
            	loadLabels();
                loadLists();
                // PAs beau à changer -- attente des 3 loads avant d'exécuter la concaténation
                //window.setTimeout(compute_to_all(), 5000);
        	} catch (exception) {
                console.log(exception);
            }
        	
        };
        
    
        function trelloGO() { 
            console.log("entering TrelloGOOOO");
            Trello.authorize({
            	  key: 'c01c2c28431ed48b2a940ea87f2b6b5c',
            	  type: 'token',
            	  type: 'f6fa5405d394e070e3a838ee7bd39b34d40f8b6e784660bcc0dfad95042a59c2',
            	  name: 'Getting Started Radar',
            	  scope: {
            	    read: 'true',
            	    write: 'true' },
            	  expiration: 'never',
            	  success: authenticationSuccess,
            	  error: authenticationFailure,
            });

        };
        
        return self;
        
    };

    return self;
};

module.exports = TrelloHelper;