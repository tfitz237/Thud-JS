(function(){			
function game() {
	var thud = this;
	thud.setup = init;
	thud.run = run;
	var thudBoard = new thudBoardfn();
	var thudPieces = new thudPiecesfn();
	// Game initialization 
	function init() {
		thud.api = new api();
		thud.scene = new THREE.Scene();
		thud.mouse = new THREE.Vector2(), thud.intersect;
		thud.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
			thud.camera.position.z = 10;
			thud.camera.position.y = -2;
			thud.camera.position.x = 7.5;
		thud.camera.up.set(0,0,1);
		thud.controls = new THREE.OrbitControls( thud.camera );
			thud.controls.center.set(7,7,0);
			thud.controls.noPan = true;
			thud.controls.noZoom = true;
			thud.controls.damping = 0.2;
			thud.controls.addEventListener( 'change', render );
			thud.controls.minPolarAngle = 0; // radians
			thud.controls.maxPolarAngle = Math.PI / 3; // radians
		thud.raycaster = new THREE.Raycaster();
		thud.renderer = new THREE.WebGLRenderer();
		thud.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( thud.renderer.domElement );
		document.addEventListener( 'mousemove', mouseMove, false );
		document.addEventListener('click', mouseClick, false);
			
			
		thud.config = {};
			
		thud.config.colors = {
			'square': { 'black': 	0x555555, 'white': 0xffffff,'middle': 0x000000},
			'piece': {"Dwarf": 0x00ff00, "Troll": 0xff0000},
			'highlight': {"Dwarf": 0x22ff22, "Troll":0xff2222}
		};
		
		//thud.config.debug = true; // Development
		thud.config.debug = false; // Production
		
		
		//thud.config.api_url = "http://96.37.4.88:12000/"; // Development API
		thud.config.api_url = "http://192.241.198.50:80/"; // Production API
		
		if(setup()) {
		// Create Scene
			thudLight();
			thudBoard.create();
			thudPieces.create();
		}
	}
	
	
	function debug(message) {
		if(thud.config.debug) {
			if(typeof message !== "undefined") 
			console.log(message);
			else return true;
		}
	}
	
	
	
	/* 	Sets up inital board state, and player information
		Gets initial board state, player, and game tokens from API
	*/
	function setup(player_one, player_two) {
		if(typeof player_one == "undefined") {
			thud.player = [{},{}];
			thud.player[0].name = "Will";
			thud.player[1].name = "Tom";
		}
		thud.game = JSON.parse(thud.api.send('start',{player_one:thud.player[0].name, player_two:thud.player[1].name}));
		if(!thud.game) return false;
		
		thud.game.token = thud.game.game;
		thud.board = thud.game.board;
		thud.player[0].token = thud.game.player_one;
		thud.player[1].token = thud.game.player_two;
		thud.player[0].type = "Dwarf";
		thud.player[1].type = "Troll";
		thud.current_player = 0;
		return true;
	}
	
	
	function thudLight() {
		var light = new THREE.DirectionalLight( 0xaaaaaa, 1 );
		light.position.set( 1, 1, 10 ).normalize();
		thud.scene.add( light );
	}			
	
	// Board functions: create board and clean board colors.
	function thudBoardfn() {
		this.create = create;
		this.clean = clean;
		
		function create() {
			var cube = new THREE.BoxGeometry(1,1,1);
			var addSpot = function(x,y) {
				if( x == 7 && y == 7) {
					thud.board[x][y]["square"] = new THREE.Mesh(new THREE.BoxGeometry(1,1,2), new THREE.MeshLambertMaterial({color:thud.config.colors.square.middle}));
					thud.board[x][y]["square"].colorSquare = "middle";
				}
				else if ((x +y) % 2 == 0) {
					thud.board[x][y]["square"] = new THREE.Mesh(cube,new THREE.MeshLambertMaterial({color:thud.config.colors.square.white}));
					thud.board[x][y]["square"].colorSquare = "white";
				}
				else {
					thud.board[x][y]["square"] = new THREE.Mesh(cube,new THREE.MeshLambertMaterial({color:thud.config.colors.square.black}));
					thud.board[x][y]["square"].colorSquare = "black";
				}
				thud.board[x][y]["square"].position.set(x,y,0);
				thud.scene.add(thud.board[x][y]['square']);
				};
				
			for (var x = 0; x < 15; x++) {
					for(var y = 0; y < 15; y++) {
						if(x < 5 && y < 5) {
							if(x + y > 4) addSpot(x,y);
						}
						else if (x > 9 && y  < 5 ) {
							if(x< y + 10) addSpot(x,y);
						} 
						else if (x >9 && y > 9) {
							if(x + y < 24) addSpot(x,y);
						}
						else if (x <  5 && y > 9) {
							if(x > y - 10) addSpot(x,y);
						}
						else {
							addSpot(x,y);	
						}	
					}
				}
		}
		
		function clean() {
		var current;
		for (var x = 0; x < 15; x++) {
			for (var y = 0; y < 15; y++) {
				current = thud.board[x][y];
				if(current.type != "null") {
					if(current.square.material.emissive.getHex() != thud.config.colors.square[current.square.colorSquare])
					changeColor(current.square, current.square.colorSquare);
					if(typeof current.obj !== "undefined") {
						if(current.obj.material.emissive.getHex() !== 0 )  {
							changeColor(current.obj, 0x000000);
						}
					}
				}
			}
		}
	}
	}	
			

			

	

	
	function nextTurn() {
		if (thud.current_player == 0 ) {
			thud.current_player = 1;
			document.getElementById("Troll").innerHTML = "Troll's turn";
			document.getElementById("Dwarf").innerHTML = "";
		}
		else {
			thud.current_player = 0;
			document.getElementById("Troll").innerHTML = "";
			document.getElementById("Dwarf").innerHTML = "Dwarf's turn";
		}
	}
	
	
	// Verifies turn, changes colors, and moves pieces
 	function selectSpot() {
		var coord = {"x":thud.intersect.position.x,"y":thud.intersect.position.y,"z":thud.intersect.position.z};
			var arr = thud.board[coord["x"]][coord["y"]];
			if(start == undefined) {
				if ((arr.type == "Dwarf" && thud.player[thud.current_player].type == "Dwarf") 
				|| (arr.type == "Troll" && thud.player[thud.current_player].type == "Troll")){ 
					start = arr;
					pieceColor = arr.obj.material.color.getHex();
					start.obj.material.color.setHex(0x0099AA);
					showMoves(start);
					
				}
			} else if(start != undefined && end == undefined) {
				end = arr;
				
				start.obj.material.color.setHex(pieceColor);
				
				if(start != end) {
					thudPieces.move(start,end);
				} else {
				thudBoard.clean();
				}
				start = undefined;
				end = undefined;
	
			}
	}
 	
 	/* 	Changes colors for available moves, including highlighting pieces for captures
 		Todo: Highlight Troll possible captures.
 		Error: From API on Dwarf possible captures
 		
 	*/
	function showMoves(start) {
		var current;
		if (start.type == "Dwarf") {
				// LEFT
				for (var x = start.obj.position.x; x < 15; x++) {
					current = thud.board[x][start.obj.position.y];
					
					if(current.type == "open") {
						
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);
					} else if (current.type != "null" && (current.square.position.x - start.obj.position.x > 0)) break;
				}
				// RIGHT
				for (var x = start.obj.position.x; x > 0; x--) {
					current = thud.board[x][start.obj.position.y];
					
					if(current.type == "open") {
						
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);
					} else if (current.type != "null" && (start != current))  {
						if(checkMove(start, current)) {
							changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
						}
						break;
					}
						
				}
				// UP
				for (var y = start.obj.position.y; y < 15; y++) {
					current =thud.board[start.obj.position.x][y];
					if(current.type =="open") {
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);						
					} else if (current.type != "null" && (start != current))  {
						if(checkMove(start, current)) {
							changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
						}
						break;
					}	
				}
				
				//DOWN
				
				for (var y = start.obj.position.y; y > 0; y--) {
					current =thud.board[start.obj.position.x][y];
					if(current.type =="open") {
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);						
					} else if (current.type != "null" && (start != current))  {
						if(checkMove(start, current)) {
							changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
						}
						break;
					}	
				}
				
				x = start.obj.position.x ,y = start.obj.position.y;
				
				// UP and RIGHT
				while( (x < 15) && y < 15 ) {
					current = thud.board[x][y];
					if(current.type == "open") {
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);
					} else if (current.type != "null" && (start != current))  {
						if(checkMove(start, current)) {
							changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
						}
						break;
					}
					
					
					x++; y++;
				}
				x = start.obj.position.x ,y = start.obj.position.y;
				// UP and LEFT
				while( (x > -1) && y < 15 ) {
					current = thud.board[x][y];
					if(current.type == "open") {
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);
					} else if (current.type != "null" && (start != current))  {
						if(checkMove(start, current)) {
							changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
						}
						break;
					}
					x--; y++;
				}
				x = start.obj.position.x ,y = start.obj.position.y;
				// DOWN and RIGHT
				while( (x < 15) && y > -1 ) {
					current = thud.board[x][y];
					if(current.type == "open") {
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);
					} else if (current.type != "null" && (start != current))  {
						if(checkMove(start, current)) {
							changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
						}
						break;
					}
					x++; y--;
				}
				x = start.obj.position.x ,y = start.obj.position.y;
				// DOWN and LEFT
				while( (x > -1) && y > -1 ) {
					current = thud.board[x][y];
					if(current.type == "open") {
						changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight[start.type]);
					} else if (current.type != "null" && (start != current))  {
						if(checkMove(start, current)) {
							changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
						}
						break;
					}
					x--; y--;
				}
				
			}
			else if (start.type == "Troll") {
				for(x = start.obj.position.x - 1; x <= start.obj.position.x + 1; x++) {
					for (y = start.obj.position.y -1; y <= start.obj.position.y + 1; y++) {
						current = thud.board[x][y];
						if(current.type == "open") {
							changeColor(current.square, current.square.material.emissive.getHex() + thud.config.colors.highlight.Troll);
						}	
						else if(current.type != "null" && (start != current)) {
							if(checkMove(start,current)) {
								changeColor(current.obj, thud.config.colors.piece[current.type] + thud.config.colors.highlight[start.type]);
							}
						}
					}
				}	
		
			}
	}
	
	function checkMove(start,current) {
			if(current.type != start.type) {
				if(debug()) console.groupCollapsed();
				debug('Checking if move is valid');
				var response = thud.api.send('move/validate', {'game':thud.game.token,'player':thud.player[thud.current_player].token, 'start':[start.square.position.x,start.square.position.y],'destination':[current.square.position.x, current.square.position.y]});
				debug("Checking -> Response from server: " + response);
				response = JSON.parse(response);
				if(typeof response == "boolean") {
					debug("Checking -> Is it valid? " + response);
					return response;
				}
				else if (typeof response == "object") {
					debug("Checking -> Is it a capture? " + (typeof response == "object"));
				if(debug()) console.groupEnd();
					return true;
				}
				else return false;
			}
	}
	
	
	
	
	function thudPiecesfn() {
		this.create = create;
		this.remove = remove;
		this.move = move;
		
		function create() {
		
			var geoPieces = {"Dwarf": new THREE.BoxGeometry( .75, .75, 1.5), 
							 "Troll": new THREE.BoxGeometry( .75, .75, 3)};
			for(var dx = 0; dx < 15; dx++) {
				for(var dy=0; dy < 15; dy++) {
					var current = thud.board[dx][dy];
					if(current.type != "null" && current.type != "open") {
						thud.board[dx][dy]["obj"] = 
							new THREE.Mesh(geoPieces[current.type].clone(), 
							new THREE.MeshLambertMaterial( {color: thud.config.colors.piece[current.type]}));
						thud.board[dx][dy]["obj"].position.set(dx,dy,1);
						thud.scene.add(thud.board[dx][dy]["obj"]);
					}
				}
			}
		}
		
		function remove(loc) {
		for (var i in loc) {
			thud.scene.remove(thud.board[loc[i][0]][loc[i][1]].obj);
			thud.board[loc[i][0]][loc[i][1]].obj = undefined;
			thud.board[loc[i][0]][loc[i][1]].type = "open";
		}
	}
	
		function move(start, end) {
			this.validate = validate;
			this.animate = animate;
			
				function validate(start, end) {
					var raw_response = thud.api.send('move',{
						'game':thud.game.token,
						'player':thud.player[thud.current_player].token, 
						'start':[start.square.position.x,start.square.position.y],
						'destination':[end.square.position.x,end.square.position.y]
					});
					var response = JSON.parse(raw_response);
					debug({'raw':raw_response,'response':response});
					var result = {};
					if (typeof response === 'object') {
							result['location'] = response;
							result['valid'] = true;
							nextTurn();
					}
					else {
						if(response) {
							result['valid'] = true;
							nextTurn();
						} else {
							result['valid'] = false;
						}
					}
					return result;
				}
			
			
			function animate(start,end) {
				var position = { x: start.obj.position.x, y: start.square.position.y };
				var target = { x : end.square.position.x, y: end.square.position.y };
				var tween = new TWEEN.Tween(position).to(target, 1000);
				tween.onUpdate(function(){
		    		start.obj.position.x = position.x;
		    		start.obj.position.y = position.y;
				});
				tween.start();
				return tween;
			}
			
			
			var val = this.validate(start,end);
			if (val['valid']) {
				var tween = this.animate(start,end);
				tween.onComplete(function() {
					if (typeof val['location'] !== "undefined") {
						thudPieces.remove(val['location']);
						document.getElementById("message").innerHTML = "Captured!!";
						setTimeout(function(){document.getElementById("message").innerHTML="Thud"},2000);
					}
					thud.board[end.square.position.x][end.square.position.y]["obj"] = start.obj;
					thud.board[start.square.position.x][start.square.position.y]["obj"] = undefined;
					thud.board[end.square.position.x][end.square.position.y]["type"] = start.type;
					thud.board[start.square.position.x][start.square.position.y]["type"] = "open";
					thudBoard.clean();
					return true;
				});
			
			}
			else return false;
		}
	}		

	function mouseMove( event ) {
		event.preventDefault();
		thud.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		thud.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}
			
	var pieceColor,start,end;
	function mouseClick(event) {
		event.preventDefault();
		thud.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		thud.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		if(thud.intersect != null) {
			selectSpot();
		}
	}
	
	function changeColor(obj, newColor) {
		obj.material.emissive.setHex(newColor);
	}
	
	function checkIntersect() {
		var intersects = thud.raycaster.intersectObjects( thud.scene.children );
		if ( intersects.length > 0 ) {
			if ( thud.intersect != intersects[ 0 ].object ) {
				if ( thud.intersect ) changeColor(thud.intersect, thud.intersect.currentHex);
					thud.intersect = intersects[ 0 ].object;
					thud.intersect.currentHex = thud.intersect.material.emissive.getHex();
					changeColor(thud.intersect,thud.intersect.currentHex + 0x222222 );
				}
			} else {
				if ( thud.intersect ) changeColor(thud.intersect, thud.intersect.currentHex );
					thud.intersect = null;
			}
	}
		
	function run() {
    	requestAnimationFrame( run );
		render();
		thud.controls.update();
		TWEEN.update();
	}
	
	function render() {
		thud.renderer.render(thud.scene, thud.camera);
		thud.raycaster.setFromCamera( thud.mouse, thud.camera );
		checkIntersect();
	
	}
	
	function api() {
		this.get = get;
		this.send = send;
		
	/*	var ws = new WebSocket("ws://96.37.4.88:12000");
    	ws.onopen = function() {
        	this.ws.send("Hello, world");
    	};
    	ws.onmessage = function (evt) {
        	alert(evt.data);
    	};
    	
    	this.send = function(message) {
    		this.ws.send(message);
    	};
    */
    	function get(event) {
    		var xmlHttp = new XMLHttpRequest();
    		xmlHttp.open( "GET", thud.config.api_url +event, false );
    		try { 
    			xmlHttp.send( null );
    			return xmlHttp.responseText;
    		}
    		catch (e) {
    			debug('Could not connect to server. ' + e)
    			return false;
    		}
		};
    
    	function send(event,data) {
    		var xmlHttp = new XMLHttpRequest();
    		xmlHttp.open("POST", thud.config.api_url+event, false);
    		try {
    		xmlHttp.send(JSON.stringify(data));
    		return xmlHttp.responseText;
    		} 
    		catch (e) {
    			debug('Could not connect to server.' + e);
    			return false;
    		}
    	};
    
	}
	
	init();
}

var game = new game();
	game.run();
})();
