
//The Last Part of the Game Project - Submission
//--- By Kliment Paskalev --- //


//--- Declare Variables ---//
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;

var mountains;

var trees_x;
var treesFront_x;

var endMap;
var canyons;

var collectable;
var isFound;

var flagpole;
var lives;

var platforms;
var enemies;

var jumpSound;
var deathSound;
var fallSound;
var completeSound;
var collectSound;
var backgroundSound;

var musicLoop;
var completedLevel;
var isRunning;

var ghost;

// PRELOAD //
	// --- Preload function to locate and load sound files within relative directory --- //
	function preload()
	{
		soundFormats("mp3","wav");
		
		jumpSound = loadSound("assets/jump.wav");
		jumpSound.setVolume(0.05);
		
		deathSound = loadSound("assets/death.wav");
		deathSound.setVolume(0.1);
		
		fallSound = loadSound("assets/fall.wav");
		fallSound.setVolume(0.1);
		
		completeSound = loadSound("assets/complete.wav");
		completeSound.setVolume(0.1);
		
		collectSound = loadSound("assets/collect.wav");
		collectSound.setVolume(0.1);
		
		backgroundSound = loadSound("assets/background.wav");
		backgroundSound.setVolume(0.05);
		
		runSound = loadSound("assets/run.mp3");
		runSound.setVolume(0.2);
	}
// END OF PRELOAD

// --- SETUP ---//
	function setup()
	{
		createCanvas(1024, 576);
		createCanvas(1024, 576).mousePressed(canvasPressed);
		floorPos_y = height * 3/4;
		lives = 3;
		startGame();
	}
// END OF SETUP

// DRAW LOOP //
	function draw()
	{
		// Background Scenery - Ground and Sky
		drawScenery();

		// Push function and all Push-able scenery objects
		push();
			translate(scrollPos , 0);

			// Draw clouds.
			drawClouds();

			// Draw mountains.
			drawMountains();

			// Draw back trees.
			drawTrees();

			// Draw canyons.
			for (var i = 0 ; i < canyons.length; i++ ) 
			{
				drawCanyon(canyons[i]);
				checkCanyon(canyons[i]);
			}

			// Draw collectable items.    
			for (var i = 0 ; i < collectables.length; i++ )
			{
				if (collectables[i].isFound == false)
				{
					drawCollectable(collectables[i]);
					checkCollectable(collectables[i]);
				}
			}

			// Draw End map sign.
			drawSign();

			//Draw flagpole
			renderFlagpole();
			
			//draw platforms
			for (var i =0; i< platforms.length; i++)
			{
				platforms[i].draw();
			}

		pop();
		//End of push - Pop to exit Push
		
		// Draw game character.
		drawGameChar();
		
		// More push objects
		push();
			translate(scrollPos,0);
			
			// Draw enemies and check if they have contect with player and deduct lives + restart game
			for ( var i = 0 ; i < enemies.length; i++)
			{
				enemies[i].draw();
				var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
				if (isContact) 
				{
					if (lives > 0)
					{
						deathSound.play();
						lives -= 1;
						startGame();
						break;
					}
				}
			}
			
			// Draw front trees.
			drawTreesFront();
			
			//Draw Death (guardian of end of map left)
			drawDeath(-1000);
		
		pop();
		// End of push
		
		// function that checks if character is running on ground and plays running sound effect
		running();
		
		gameOver();
		levelCompleted();
		

		// Player screen interface - Game score, Lives, Music sign, Controlls
		drawUI();

		
		// Move lef/right and Side Scrolling when character moves near window edge
		sideScroll();


 		// Logic - falling(or not), plummeting (or not)
		fallOrPlummet();

		// Check if player has reached flag at end of level
		if (flagpole.isReached == false)
		{
			checkFlagpole();
		}

		// Update real position of gameChar for collision detection.
		gameChar_world_x = gameChar_x - scrollPos;

		// function to check if player has died
		checkPlayerDie();
	}
// END OF DRAW LOOP //


// --- FUNCTIONS --- //
	// --- Controlls and Movement Functions --- //
		function keyPressed()
		{	
			if ( ghost == false )
				{
					if(key == 'A' || keyCode == 37)
					{
						isLeft = true;
					}

					if(key == 'D' || keyCode == 39)
					{
						isRight = true;
					}

					if (key == "W" || keyCode == 38 || key == " ")
					{
						if(!isFalling && !isPlummeting)
						{
							jumpSound.play();
							gameChar_y -= 120;
						}
					}
				}
			else
			{
				return;
			}
		}

		// stop going Left/Right when key is no longer pushed
		function keyReleased()
		{
			if(key == 'A' || keyCode == 37)
			{
				isLeft = false;
			}

			if(key == 'D' || keyCode == 39)
			{
				isRight = false;
			}
		}
	// End of controlls and movement functions

	// Background music "Play" sign on screen
		function musicButton()
		{
			if (musicLoop == true)
			{
				//draw sign
				fill(200, 0, 0);
				noStroke();
				textSize(20);
				text("Click to stop music", 10, 55);
			}
		else if(musicLoop == false)
			{
				// draw sign
				fill(0,255,40);
				noStroke();
				textSize(20);
				text("Click to play music", 10, 55);
			}
		}
	// End of "Play" music sign

	// Function to check if character is running on the ground and play running sound
		function running()
		{
			if ((isLeft == true ||  isRight == true) && !runSound.isPlaying() && gameChar_y == floorPos_y)
			{
				runSound.loop();
			}
		else if(isRight == false && isLeft == false || gameChar_y < floorPos_y || ghost == true)
			{
				runSound.stop();
			}
		}
	// End of running sound function

	// Function that plays the background music when user clicks on screen
		function canvasPressed()
		{
			if (musicLoop == true)
			{
				musicLoop = false;
				backgroundSound.pause();
				musicButton();
				console.log("Background music is paused.");
			}
			else if(musicLoop == false )
			{
				musicLoop = true;
				backgroundSound.loop();
				musicButton();
				console.log("Background music is playing.");
			}
		}
	// end of click-screen-play-music function

	// Function to draw the game character.
	function drawGameChar()
	{
		if ( ghost == false )
		{
			// Left Falling
				if(isLeft && isFalling)
				{
					//Legs
					stroke(50,150,30);
					strokeWeight(3);
					//Left leg
					line(gameChar_x - 5, gameChar_y - 19, gameChar_x - 9, gameChar_y - 15);
					line(gameChar_x - 9, gameChar_y - 15, gameChar_x - 6, gameChar_y - 5);
					//Right leg
					line(gameChar_x + 3, gameChar_y - 19, gameChar_x + 9, gameChar_y - 5);
					noStroke();
					strokeWeight(0);
					//body
					fill(10,190,30);
					ellipse(gameChar_x, gameChar_y - 35,17,40);
					//Arms
					stroke(50,150,30);
					strokeWeight(3);
					//left arm
					line(gameChar_x - 12, gameChar_y - 35, gameChar_x - 14, gameChar_y - 45);
					//right arm
					stroke(50,150,30);
					line(gameChar_x + 10, gameChar_y - 35, gameChar_x + 16, gameChar_y - 25);
					noStroke();
					strokeWeight(1);
					//head
					fill(100,20,180);
					rect(gameChar_x - 10, gameChar_y - 65,15,20);
					//nose
					fill(30,10,70);
					rect(gameChar_x - 16, gameChar_y - 50,6,4);
				}
			// Right Falling
				else if(isRight && isFalling)
				{
					//Legs
					stroke(50,150,30);
					strokeWeight(3);
					//Left leg
					line(gameChar_x - 5, gameChar_y - 19, gameChar_x - 11, gameChar_y - 5);
					//Right leg
					line(gameChar_x + 3, gameChar_y - 19, gameChar_x + 7, gameChar_y - 15);
					line(gameChar_x + 7, gameChar_y - 15, gameChar_x + 3, gameChar_y - 5);
					noStroke();
					strokeWeight(0);
					//body
					fill(10,190,30);
					ellipse(gameChar_x, gameChar_y - 35, 17, 40);
					//Arms
					stroke(50,150,30);
					strokeWeight(3);
					//left arm
					line(gameChar_x - 10, gameChar_y - 35, gameChar_x - 16, gameChar_y - 25);
					//right arm
					stroke(50,150,30);
					line(gameChar_x + 11, gameChar_y - 35, gameChar_x + 14, gameChar_y - 45);
					noStroke();
					strokeWeight(1);
					//head
					fill(100,20,180);
					rect(gameChar_x - 5, gameChar_y - 65,15,20);
					//nose
					fill(30,10,70);
					rect(gameChar_x + 10, gameChar_y - 50,6,4);
				}
			// Running Left
				else if(isLeft)
				{
					//Legs
					stroke(50,150,30);
					strokeWeight(3);
					//Left leg
					line(gameChar_x - 5, gameChar_y - 14, gameChar_x - 9, gameChar_y - 11);
					line(gameChar_x - 9, gameChar_y - 11, gameChar_x - 6, gameChar_y - 1);
					//Right leg
					line(gameChar_x + 3, gameChar_y - 14, gameChar_x + 5, gameChar_y);
					noStroke();
					strokeWeight(0);
					//body
					fill(10,190,30);
					ellipse(gameChar_x, gameChar_y - 30, 17, 40);
					//Arms
					stroke(50,150,30);
					strokeWeight(3);
					//left arm
					line(gameChar_x - 10, gameChar_y - 30, gameChar_x - 15, gameChar_y - 22);
					//right arm
					stroke(50,150,30);
					line(gameChar_x + 11, gameChar_y - 30, gameChar_x + 11, gameChar_y - 18);
					noStroke();
					strokeWeight(1);
					//head
					fill(100,20,180);
					rect(gameChar_x -10 , gameChar_y - 60,15,20);
					//nose
					fill(30,10,70);
					rect(gameChar_x - 16, gameChar_y - 50,6,4);
				}
			// Running Right
				else if(isRight)
				{
					//Legs
					stroke(50,150,30);
					strokeWeight(3);
					//Left leg
					line(gameChar_x - 5, gameChar_y - 14, gameChar_x - 8, gameChar_y);
					//Right leg
					line(gameChar_x + 3, gameChar_y - 14, gameChar_x + 7, gameChar_y - 11);
					line(gameChar_x + 7, gameChar_y - 11, gameChar_x + 3, gameChar_y - 1);
					noStroke();
					strokeWeight(0);
					//body
					fill(10,190,30);
					ellipse(gameChar_x, gameChar_y - 30,17,40);
					//Arms
					stroke(50,150,30);
					strokeWeight(3);
					//left arm
					line(gameChar_x - 12, gameChar_y - 30, gameChar_x - 12, gameChar_y - 18);
					//right arm
					stroke(50,150,30);
					line(gameChar_x + 10, gameChar_y - 30, gameChar_x + 15, gameChar_y - 22);
					noStroke();
					strokeWeight(1);
					//head
					fill(100,20,180);
					rect(gameChar_x - 5, gameChar_y - 60,15,20);
					//nose
					fill(30,10,70);
					rect(gameChar_x + 10, gameChar_y - 50,6,4);
				}
			// Is falling fast
				else if(isFalling || isPlummeting)
				{
					//Legs
					stroke(50,150,30);
					strokeWeight(3);
					//Left leg
					line(gameChar_x - 5, gameChar_y - 19, gameChar_x - 9, gameChar_y - 15);
					line(gameChar_x - 9, gameChar_y - 15, gameChar_x - 6, gameChar_y - 5);
					//Right leg
					line(gameChar_x + 3, gameChar_y - 19, gameChar_x + 7, gameChar_y - 15);
					line(gameChar_x + 7, gameChar_y - 15, gameChar_x + 3, gameChar_y - 5);
					noStroke();
					strokeWeight(0);
					//body
					fill(10,190,30);
					ellipse(gameChar_x, gameChar_y - 35,20,40);
					//Arms
					stroke(50,150,30);
					strokeWeight(3);
					//left arm
					line(gameChar_x - 12, gameChar_y - 35, gameChar_x - 14, gameChar_y - 45);
					//right arm
					stroke(50,150,30);
					line(gameChar_x + 11, gameChar_y - 35, gameChar_x + 14, gameChar_y - 45);
					noStroke();
					strokeWeight(1);
					//head
					fill(100,20,180);
					rect(gameChar_x - 10, gameChar_y - 65,20,20);
					//nose
					fill(30,10,70);
					rect(gameChar_x - 2, gameChar_y - 50,4,4);
					//eyes
					fill(255);
					rect(gameChar_x - 6, gameChar_y - 54,2,2);
					rect(gameChar_x + 4, gameChar_y - 54,2,2);
				}
			// Is standing
				else
				{
					//Legs
					stroke(50,150,30);
					strokeWeight(3);
					//Left leg
					line(gameChar_x - 5, gameChar_y - 14, gameChar_x - 6, gameChar_y);
					//Right leg
					line(gameChar_x + 3, gameChar_y - 14, gameChar_x + 3, gameChar_y);
					noStroke();
					strokeWeight(0);
					//body
					fill(10,190,30);
					ellipse(gameChar_x, gameChar_y - 30,20,40);
					//Arms
					stroke(50,150,30);
					strokeWeight(3);
					//left arm
					line(gameChar_x - 12, gameChar_y - 30, gameChar_x - 9, gameChar_y - 18);
					//right arm
					stroke(50,150,30);
					line(gameChar_x + 11, gameChar_y - 30, gameChar_x + 9, gameChar_y - 18);
					noStroke();
					strokeWeight(1);
					//head
					fill(100,20,180);
					rect(gameChar_x - 10, gameChar_y - 60,20,20);
					//nose
					fill(30,10,70);
					rect(gameChar_x - 2, gameChar_y - 50,4,4);
					//eyes
					fill(255);
					rect(gameChar_x - 6, gameChar_y - 54,2,2);
					rect(gameChar_x + 4, gameChar_y - 54,2,2);
				}
		}
		else
		{
			return;
		}
	}

	// Function to draw cloud objects.
	function drawClouds()
	{
		for (var i = 0 ; i < clouds.length; i++ )
		{
		fill(215);
		ellipse(clouds[i].x_pos , clouds[i].y_pos , clouds[i].size_x , clouds[i].size_y);
		fill(222);
		ellipse(clouds[i].x_pos +30 , clouds[i].y_pos , clouds[i].size_x + 30, clouds[i].size_y + 20);
		fill(222);
		ellipse(clouds[i].x_pos +120 , clouds[i].y_pos , clouds[i].size_x + 20, clouds[i].size_y + 20);
		fill(230);
		ellipse(clouds[i].x_pos +80 , clouds[i].y_pos , clouds[i].size_x + 40, clouds[i].size_y + 40);
		noFill();  
		}
	}

	// Function to draw mountains objects.
	function drawMountains()
	{
		for (var i=0 ; i < mountains.length; i++ )
		{
			//mountain
			fill(80);
			triangle(mountains[i].x_pos, mountains[i].y_pos, mountains[i].x_pos + 100,mountains[i].y_pos, mountains[i].x_pos + 50, mountains[i].y_pos - 132);
			fill(70);
			triangle(mountains[i].x_pos + 50, mountains[i].y_pos, mountains[i].x_pos + 250,mountains[i].y_pos, mountains[i].x_pos + 150, 200);
			fill(80);
			triangle(mountains[i].x_pos + 200, mountains[i].y_pos, mountains[i].x_pos + 300,mountains[i].y_pos, mountains[i].x_pos + 250, mountains[i].y_pos - 182);
			//mountain snow
			fill(220,220,220,200);
			triangle(mountains[i].x_pos + 38, mountains[i].y_pos - 100, mountains[i].x_pos + 62, mountains[i].y_pos - 100, mountains[i].x_pos + 50, mountains[i].y_pos - 132);
			triangle(mountains[i].x_pos + 128, mountains[i].y_pos - 180, mountains[i].x_pos + 172, mountains[i].y_pos - 180, mountains[i].x_pos + 150, mountains[i].y_pos - 232);
			triangle(mountains[i].x_pos + 238, mountains[i].y_pos - 142, mountains[i].x_pos + 262, mountains[i].y_pos -142, mountains[i].x_pos + 250, mountains[i].y_pos - 182);
			noFill();
		}
	}

	// Function to draw Red trees objects.
	function drawTrees()
	{
		for (var i = 0 ; i < trees_x.length; i++ )
		{    
			fill(110,90,90);
			rect(trees_x[i],floorPos_y - 50,30,50);
			fill(255,142, 100);    
			triangle(trees_x[i] - 30,floorPos_y - 50,trees_x[i] + 60 ,floorPos_y - 50,trees_x[i] + 15,floorPos_y - 120);
			fill(229,118, 78);   
			triangle(trees_x[i] - 25,floorPos_y - 80,trees_x[i] + 55,floorPos_y - 80,trees_x[i] + 15,floorPos_y - 150);
			fill(185,92, 58);   
			triangle(trees_x[i] - 20,floorPos_y - 110,trees_x[i] + 50,floorPos_y - 110,trees_x[i] + 15,floorPos_y - 170);
			noFill();
		} 
	}

	// draw Green front trees
	function drawTreesFront()
	{
		for (var i = 0 ; i < treesFront_x.length; i++ )
		{    
			fill(100,80,20);
			rect(treesFront_x[i],floorPos_y - 24,30,110);
			fill(70,200,0);
			triangle(treesFront_x[i] - 30,floorPos_y + 44,treesFront_x[i] + 60 ,floorPos_y + 44,treesFront_x[i] + 15,floorPos_y - 20);
			fill(80,190,50);
			triangle(treesFront_x[i] - 25,floorPos_y + 14,treesFront_x[i] + 55,floorPos_y + 14,treesFront_x[i] + 15,floorPos_y - 40);
			fill(90,180,100);
			triangle(treesFront_x[i] - 20,floorPos_y - 16,treesFront_x[i] + 50,floorPos_y - 16,treesFront_x[i] + 15,floorPos_y - 60);
			noFill();
		}
	}

	//End of map sign 
	function drawSign() 
	{
		for (var i = 0 ; i < endMap.length; i++ )
		{
			fill(220, 155, 100, 200);
			rect(endMap[i], floorPos_y - 200, -200, - 50);
			textSize(35);
			fill(255);
			text("End of map!",endMap[i] - 195, floorPos_y - 215);
			noFill();
		}
	}

	// Function to draw canyon objects.
	function drawCanyon(t_canyon)
	{
		fill(150, 200, 200);
		beginShape();
		vertex (t_canyon.x_pos, floorPos_y);
		vertex (t_canyon.x2_pos, floorPos_y);
		vertex (t_canyon.x2_pos+15, height);
		vertex (t_canyon.x_pos-15, height);
		endShape();
	}

	// Function to check character is over a canyon.
	function checkCanyon(t_canyon)
	{
		if (t_canyon.x_pos < gameChar_world_x && gameChar_world_x < t_canyon.x2_pos && gameChar_y >= floorPos_y)
		{
			isPlummeting = true; 
			isLeft = false;
			isRight = false;
		}
	}

	// Function to draw collectable objects.
	function drawCollectable(t_collectable)
	{
		fill(255,0,0);
		ellipse(t_collectable.x_pos, t_collectable.y_pos, t_collectable.size);
		fill(230);
		ellipse(t_collectable.x_pos - (t_collectable.size / 4), t_collectable.y_pos - 2 , 3 , 9 );
		stroke(0,130,0);
		strokeWeight(3);
		line(t_collectable.x_pos, t_collectable.y_pos - (t_collectable.size / 2) , t_collectable.x_pos + 8 , t_collectable.y_pos - t_collectable.size);
		noStroke();
		fill(0,150,0);
		ellipse(t_collectable.x_pos + 2 , t_collectable.y_pos - t_collectable.size + 3 , 5 , 15 );
		noFill();
	}

	// Function to check character has collected an item.
	function checkCollectable(t_collectable)
	{
		if ( dist ( gameChar_world_x , gameChar_y , t_collectable.x_pos , t_collectable.y_pos ) < 30 )
		{
			t_collectable.isFound = true;
			collectSound.play();
			game_score += 1;
		}
	}

	// Function to draw Death
	function drawDeath(death_pos) {
		noStroke();
		fill(10);
		var death_pos = death_pos;
		var death_width = 50
		var death_height = 200;
		//black cloak
		rect(
			death_pos - death_width,
			death_height,
			100, 
			floorPos_y - death_height);
		triangle(
			death_pos - death_width,
			death_height,
			death_pos + death_width,
			death_height,
			death_pos,
			death_height - 50)
		ellipse(
			death_pos,
			death_height - 50,
			60,
			80);
		//right arm
		beginShape();
		vertex(death_pos + 120, death_height + 20 );
		vertex(death_pos + 120, death_height + 40 );
		vertex(death_pos, death_height + 10 );
		vertex(death_pos, death_height - 15);
		endShape();
		//left arm
		beginShape();
		vertex(death_pos - 100, death_height + 80 );
		vertex(death_pos - 100, death_height + 60 );
		vertex(death_pos - 40, death_height - 10);
		vertex(death_pos - 40, death_height + 10);
		endShape();
		//hands
		fill(255);
		ellipse(death_pos - 100, death_height + 70, 25, 25);
		ellipse(death_pos + 120, death_height + 30, 25, 25);
		// scythe
		//hilt
		fill(110);
		beginShape();
		vertex(death_pos - 140, death_height - 40 );
		vertex(death_pos - 150, death_height - 50 );
		vertex(death_pos - 42, floorPos_y);
		vertex(death_pos - 37, floorPos_y);
		endShape();
		//blade
		fill(110);
		beginShape();
		vertex(death_pos - 140, death_height - 50 );
		vertex(death_pos - 180, death_height - 70 );
		vertex(death_pos - 210, death_height - 80 );
		vertex(death_pos - 240, death_height - 70 );
		vertex(death_pos - 260, death_height);
		vertex(death_pos - 240, death_height - 20 );
		vertex(death_pos - 210, death_height - 50 );	
		vertex(death_pos - 140, death_height - 40 );
		endShape();
		//death speaks
		fill(0, 0, 0, 100);
		rect(death_pos - 155, death_height - 150, 180, 50);
		textSize(35);
		fill(255);
		text("Turn back!",death_pos - 150, death_height - 115);
		noFill();
	}

	// function to draw end of level Flag
	function renderFlagpole()
	{
		strokeWeight(5);
		stroke(130);
		line(flagpole.x_pos, floorPos_y + 2 , flagpole.x_pos, floorPos_y - 250);

		if(flagpole.isReached)
		{
			completeLevel();
			fill(0,200,100);
			noStroke();
			rect(flagpole.x_pos + 2, floorPos_y - 250, 60, 40);
		}
		else 
		{
			fill(105,0,50);
			noStroke();
			rect(flagpole.x_pos + 2, floorPos_y - 50, 60, 40);
		}
	}

	// Check if Flag is reached by Player
	function checkFlagpole()
	{
		var d = abs(gameChar_world_x - flagpole.x_pos) ;

		if (d < 15)
		{
			flagpole.isReached = true;
		}
	}

	// Factory function to create platfomr object and methods
	function createPlatforms(x, y, length) 
	{
		var p = {
			x: x,
			y: y,
			length: length,
			draw: function()
			{
				//plank
					fill(170, 70, 10);
					rect(this.x, this.y, this.length, 20);
					fill(210, 100, 30);
					rect(this.x, this.y, this.length, 4);
					fill(190, 90, 20);
					rect(this.x, this.y + 2, this.length, 4);
					fill(170, 70, 10);
					rect(this.x, this.y + 4, this.length, 4);
					fill(140, 65, 5);
					rect(this.x, this.y + 14, this.length, 4);
					fill(120, 60, 0);
					rect(this.x, this.y + 18, this.length, 4);
				//white ropes
					stroke(255);
					strokeWeight(0.7);
					var centerPlatform = this.x + (this.length / 2 );
					var balloon = this.y - 110;
					line(this.x, this.y, centerPlatform , this.y -100);
					line(this.x + this.length, this.y, centerPlatform , this.y -100);
					line(centerPlatform - 20, this.y, centerPlatform , this.y -100);
					line(centerPlatform + 20, this.y, centerPlatform , this.y -100);
					line(centerPlatform + 10, this.y -115, centerPlatform , this.y -100);
					line(centerPlatform -14, this.y -115, centerPlatform , this.y -100);
				//balloon blue
					var balloon2 = balloon - 8;
					noStroke();
					fill(0, 0, 255);
					ellipse(centerPlatform + 10, balloon2 - 20, 35, 45);
					triangle(centerPlatform + 10, this.y -115, centerPlatform + 6, this.y -106, centerPlatform + 14, this.y -106);
					fill(255);
					ellipse(centerPlatform + 21, balloon2 - 27, 3, 7);
				//balloon yellow
					var balloon3 = balloon - 5;
					noStroke();
					fill(235, 235, 0);
					ellipse(centerPlatform - 14, balloon3 - 30, 30, 40);
					triangle(centerPlatform -14, this.y -125, centerPlatform - 17, this.y -117, centerPlatform - 11, this.y -117);
					fill(255);
					ellipse(centerPlatform - 10, balloon3 - 39, 4, 7);
				//balloon red
					noStroke();
					fill(255, 0, 100);
					ellipse(centerPlatform, balloon - 20, 30, 50);
					triangle(centerPlatform , this.y -105, centerPlatform - 5, this.y -95, centerPlatform + 5, this.y -95);
					fill(255);
					ellipse(centerPlatform + 8, balloon - 27, 3, 9);
			},
			// method to check if player is stepping on platform or not
			checkContact: function(gameChar_x, gameChar_y)
			{
				var platformMargin = this.y - gameChar_y;
				if(gameChar_x > this.x && gameChar_x < this.x + this.length && gameChar_y <= this.y)
				{
					isFalling = false;
					var d = this.y - gameChar_y;
					if (d >= 0 && d < 2)
					{
						return true;
					}
				}
				return false;
			}
		}
		return p;
	}

	// Function that shows text and plays music on Level completion
	function completeLevel()
	{
		if (completedLevel == false)
		{
			completedLevel = true;
			completeSound.play();
			running();
			if (musicLoop == true)
			{
				musicLoop = false;
				backgroundSound.stop();
				musicButton();
				console.log("Background music is paused.");
			}
		}
		else
		{
			return false;
		}
	}

	// Function that shows text and plays music on Level completion
		function gameOverSound()
		{
			if (gameOver == false)
			{
				gameOver = true;
				running();
				if (musicLoop == true)
				{
					musicLoop = false;
					backgroundSound.stop();
					musicButton();
					console.log("Background music is paused.");
				}
			}
			else
			{
				return false;
			}
		}

	// Check if player is falling, deduct lives, if still has lives restart game
	function checkPlayerDie()
	{
		if (gameChar_y > (height + 70) && lives >= 1)
		{
			lives -= 1;
			fallSound.play();
			// Check if player has lives left so they start over
			if (lives != 0)
			{
				startGame();
			}
		}
	}

	// Constructor function to draw enemies and their methods
	function Enemies(x, y, range)
	{
		this.x = x;
		this.y = y;
		this.range = range;
		this.currentX = x;
		this.inc = 1;

		// method to change enemy X coordinate when they move left and right
		this.update = function()
		{
			this.currentX += this.inc;
			
			if (this.currentX >= this.x + this.range)
			{
				this.inc = -1;
				this.directionLeft = true;
			}
			else if ( this.currentX < this.x) 
			{
				this.inc = 1;
				this.directionLeft = false;
			}
		}

		// property and method to draw enemy differently when walking left and right
		this.directionLeft = false;
		this.draw = function()
		{
			this.update();
			//tail
			if (this.directionLeft == true)
			{
				noFill();
				stroke(255,0,0);
				strokeWeight(3);
				beginShape();
				curveVertex(this.currentX + 20,this.y +25);
				curveVertex(this.currentX + 20,this.y + 25);
				curveVertex(this.currentX + 25,this.y + 20);
				curveVertex(this.currentX + 33,this.y + 10);
				curveVertex(this.currentX + 28,this.y );
				curveVertex(this.currentX + 43,this.y - 10);
				curveVertex(this.currentX + 46,this.y - 15);
				curveVertex(this.currentX + 46,this.y - 15);
				endShape();
				fill(255,0,0);
				triangle(this.currentX + 44, this.y -15,
						this.currentX + 48, this.y - 15,
						this.currentX +46, this.y - 18);
			}
			else if (this.directionLeft == false)
			{
				noFill();
				stroke(255,0,0);
				strokeWeight(3);
				beginShape();
				curveVertex(this.currentX - 20,this.y +25);
				curveVertex(this.currentX - 20,this.y + 25);
				curveVertex(this.currentX - 25,this.y + 20);
				curveVertex(this.currentX - 33,this.y + 10);
				curveVertex(this.currentX - 28,this.y );
				curveVertex(this.currentX - 43,this.y - 10);
				curveVertex(this.currentX - 46,this.y - 15);
				curveVertex(this.currentX - 46,this.y - 15);
				endShape();
				fill(255,0,0);
				triangle(this.currentX - 44, this.y -15,
						this.currentX - 48, this.y - 15,
						this.currentX - 46, this.y - 18);
			}
			//flame underneath
			fill(255, 255, 0);
			beginShape();
			vertex(this.currentX, this.y);
			vertex(this.currentX + 20, this.y);
			vertex(this.currentX + 20, this.y + random(40,46));
			vertex(this.currentX + 10, this.y + random(25,36));
			vertex(this.currentX + 0, this.y + random(40,46));
			vertex(this.currentX - 10, this.y + random(25,36));
			vertex(this.currentX - 20, this.y + random(40,46));
			vertex(this.currentX - 20, this.y);
			endShape();
			fill(255, 155, 0);
			beginShape();
			vertex(this.currentX, this.y);
			vertex(this.currentX + 20, this.y);
			vertex(this.currentX + 20, this.y + random(40,45));
			vertex(this.currentX + 10, this.y + random(25,35));
			vertex(this.currentX + 0, this.y + random(40,45));
			vertex(this.currentX - 10, this.y + random(25,35));
			vertex(this.currentX - 20, this.y + random(40,45));
			vertex(this.currentX - 20, this.y);
			endShape();
			//main body RED
			fill(255, 0, 0);
			ellipse(this.currentX, this.y, 40, 40);
			fill(255, 0, 0);
			beginShape();
			vertex(this.currentX, this.y);
			vertex(this.currentX + 20, this.y);
			vertex(this.currentX + 20, this.y + 40);
			vertex(this.currentX + 10, this.y + 30);
			vertex(this.currentX + 0, this.y + 40);
			vertex(this.currentX - 10, this.y + 30);
			vertex(this.currentX - 20, this.y + 40);
			vertex(this.currentX - 20, this.y);
			endShape();
			//eyes
			noStroke();
			if (this.directionLeft == true)
			{
					fill(255);
					ellipse(this.currentX - 5, this.y , 8, 12);
					ellipse(this.currentX + 5, this.y , 8, 12);
					fill(0);
					ellipse(this.currentX - 7, this.y , 4, 4);
					ellipse(this.currentX + 2, this.y , 4, 4);
					stroke(0);
					strokeWeight(2);
					line(this.currentX -2, this.y -3, this.currentX - 10, this.y -10);
					line(this.currentX +2, this.y -3, this.currentX + 10, this.y -10);
			}
			else if (this.directionLeft == false)
			{
					fill(255);
					ellipse(this.currentX - 5, this.y , 8, 12);
					ellipse(this.currentX + 5, this.y , 8, 12);
					fill(0);
					ellipse(this.currentX - 2, this.y , 4, 4);
					ellipse(this.currentX + 7, this.y , 4, 4);
					stroke(0);
					strokeWeight(2);
					line(this.currentX -2, this.y -3, this.currentX - 10, this.y -10);
					line(this.currentX +2, this.y -3, this.currentX + 10, this.y -10);
			}
			// spikes
			strokeWeight(0.3);
			fill(135);
			ellipse(this.currentX - 15, this.y + 10, 10, 10);
			ellipse(this.currentX - 9, this.y - 13, 10, 10);
			ellipse(this.currentX + 9, this.y - 13, 10, 10);
			ellipse(this.currentX + 15, this.y + 10, 10, 10);
			//left spike
			beginShape();
			vertex(this.currentX - 15, this.y + 5);
			vertex(this.currentX - 40, this.y + 10);
			vertex(this.currentX -15, this.y + 15);
			endShape();
			//left top spike
			beginShape();
			vertex(this.currentX - 14, this.y - 12);
			vertex(this.currentX - 30, this.y - 30);
			vertex(this.currentX -4, this.y - 15);
			endShape();
			// right top spike
			beginShape();
			vertex(this.currentX + 14, this.y - 12);
			vertex(this.currentX + 30, this.y - 30);
			vertex(this.currentX +4, this.y - 15);
			endShape();
			//right spike
			beginShape();
			vertex(this.currentX + 15, this.y + 5);
			vertex(this.currentX + 40, this.y + 10);
			vertex(this.currentX +15, this.y + 15);
			endShape();
			noStroke();
			//mouth
			fill(0);
			triangle(this.currentX -9, this.y + 10,
					this.currentX + 9, this.y + 10,
					this.currentX, this.y + 18);
			//teeth
			//left tooth
			fill(255);
			triangle(this.currentX -5, this.y + 10,
					this.currentX - 2, this.y + 10,
					this.currentX - 4, this.y + 15);
			//right tooth
			triangle(this.currentX +5, this.y + 10,
					this.currentX + 2, this.y + 10,
					this.currentX + 4, this.y + 15);
			
		}
		
		// method to check if the enemy is within distance with player to kill them
		this.checkContact = function()
		{
			var d = dist(this.currentX, this.y, gameChar_world_x, gameChar_y);
			if( d < 30)
			{
				return true;
			}
			return false;
		}
	}

	// Player UI - game score, lives, music button, controlls
	function drawUI()
	{
		// Game Score
		fill(255);
		noStroke();
		textSize(20);
		text("Score: " + game_score, 10, 30);
		
		//controlls instruction
		textSize(17);
		text("A", 10, height - 10);
		text("S", 30, height - 10);
		text("D", 50, height - 10);
		text("W", 28, height - 30);
		textSize(14);
		text("Controls:", 10, height - 50);
		
		// Lives
		fill(255);
		noStroke();
		textSize(20);
		text("Lives: " + lives, 940, 30);
		
		// Life tokens
		for ( i = 0; i < lives; i++)
		{
			var lifeTokens_posX = 920;
			var lifeTokens_posY = 73;
			//head
			fill(100,20,180);
			rect(lifeTokens_posX - 10 - (25*i), lifeTokens_posY - 60,20,20);
			//nose
			fill(30,10,70);
			rect(lifeTokens_posX - 2 - (25*i), lifeTokens_posY - 50,4,4);
			//eyes
			fill(255);
			rect(lifeTokens_posX - 6 - (25*i), lifeTokens_posY - 54,2,2);
			rect(lifeTokens_posX + 4 - (25*i), lifeTokens_posY - 54,2,2);
		}
			
		musicButton();
	}

	function drawScenery()
	{
		// draw sky
		noStroke();
		fill(150, 200, 200);
		rect(0, 0, width, floorPos_y);
		fill(145, 195, 195);
		rect(0, 0, width, 7*floorPos_y/8);
		fill(140, 190, 190);
		rect(0, 0, width, 6*floorPos_y/8);
		fill(135, 185, 185);
		rect(0, 0, width, 5*floorPos_y/8);
		fill(130, 180, 180);
		rect(0, 0, width, 4*floorPos_y/8);
		fill(125, 175, 175);
		rect(0, 0, width, 3*floorPos_y/8);
		fill(120, 170, 170);
		rect(0, 0, width, 2*floorPos_y/8);
		fill(115, 165, 165);
		rect(0, 0, width, floorPos_y/8);
		// draw ground
		noStroke();
		fill(180, 155, 100);
		rect(0, floorPos_y, width, height/4); 
		fill(190, 155, 100, 200);
		rect(0, floorPos_y + 30, width, height/4); 
		fill(200, 155, 100, 200);
		rect(0, floorPos_y + 60, width, height/4);
		fill(210, 155, 100, 200);
		rect(0, floorPos_y + 90, width, height/4);
		fill(220, 155, 100, 200);
		rect(0, floorPos_y + 120, width, height/4);
	}

	// Character move and side-scrolling function
	function sideScroll()
	{
		if(isLeft)
		{
			if(gameChar_x > width * 0.3)
			{
				gameChar_x -= 5;
				if(isRunning == false)
				{
					isRunning = true;
				}
			}
			else
			{
				scrollPos += 5;
				isRunning = false;
			}
		}

		if(isRight)
		{
			if(gameChar_x < width * 0.7)
			{
				gameChar_x  += 5;
				if(isRunning == false)
				{
					isRunning = true;
				}
			}
			else
			{
				scrollPos -= 5; // negative for moving against the background
				isRunning = false;
			}
		}
	}

	// Character Falling Logic
	function fallOrPlummet()
	{
		if (isPlummeting == true)
		{
			gameChar_y += 7;
			isRunning = false;
		}

		if (isFalling == true)
		{
			gameChar_y += 2;
			isRunning = false;
		}
		
		if (gameChar_y < floorPos_y)
		{
			var isContact = false;
			for ( var i = 0; i < platforms.length; i++)
			{
				if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
				{
					isContact = true;
					break;
				}
			}
			if (isContact == false)
			{
				isFalling = true;
			}
		} 
		else 
		{
			isFalling = false;
		}
	}

    // Game Over or Level Complete
	function gameOver()
	{
		if (lives < 1)
		{
			fill(255);
			stroke(100,0,0);
			strokeWeight(3);
			textSize(100);
			text("GAME OVER", 250, height/2);
			textSize(40);
			text("Press Space to restart", 300, height/2 + 50);
			noStroke();
			ghost = true;
			gameOverSound();
			backgroundSound.stop();
			

			if (keyCode == 38 || key == " ")
			{
				startGame();
				lives = 3;
			}
			else
			{
				return;
			}
		}
	}

	function levelCompleted()
	{
		if (flagpole.isReached == true)
		{
			fill(255);
			stroke(0,100,0);
			strokeWeight(3);
			textSize(100);
			text("Level complete", 250, height/2);   
			textSize(40);
			text("Press Space to continue", 300, height/2 + 50);
			noStroke();
			ghost = true;
			completeLevel();

			if (keyCode == 38 || key == " ")
			{
				startGame();
				lives = 3;
			}
			else
			{
				return;
			}
		}
	}


	// Function to Start/Restart game - Re/Initializes all variables, arrays and object property values
	function startGame()
	{
		gameChar_x = width/2;
		gameChar_y = floorPos_y - 50;

		// Variable to control the background scrolling.
		scrollPos = 0;
	
		// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
		gameChar_world_x = gameChar_x - scrollPos;

		// Boolean variables to control the movement of the game character.
		isLeft = false;
		isRight = false;
		isFalling = false;
		isPlummeting = false;

		// Initialise arrays of scenery objects.
		mountains = [
			{x_pos: -120 , y_pos: 432 },
			{x_pos: 820 , y_pos: 432 },
			{x_pos: 900 , y_pos: 432 },
			{x_pos: 1700 , y_pos: 432 },
			{x_pos: 2400 , y_pos: 432 },
			{x_pos: 2600 , y_pos: 432 }
		]

		clouds = 
		[
			{x_pos:- 400, y_pos: 70, size_x: 40, size_y: 34 }, 
			{x_pos:234, y_pos: 80, size_x: 30, size_y: 20 }, 
			{x_pos:453, y_pos: 120, size_x: 52, size_y: 42 }, 
			{x_pos:743, y_pos: 100, size_x: 37, size_y: 27 },  
			{x_pos:1230, y_pos: 200, size_x: 45, size_y: 35 }, 
			{x_pos:1405, y_pos: 170, size_x: 32, size_y: 22 }, 
			{x_pos:1555, y_pos: 130, size_x: 47, size_y: 37 }, 
			{x_pos:1950, y_pos: 123, size_x: 55, size_y: 48 },  
			{x_pos:2250, y_pos: 145, size_x: 64, size_y: 44 },  
			{x_pos:2500, y_pos: 177, size_x: 36, size_y: 39 },  
			{x_pos:3000, y_pos: 180, size_x: 50, size_y: 30 }, 
			{x_pos:3250, y_pos: 145, size_x: 64, size_y: 44 }, 
			{x_pos:3530, y_pos: 200, size_x: 45, size_y: 35 }, 
			{x_pos:3905, y_pos: 170, size_x: 32, size_y: 22 }
		];
		
		trees_x = 
		[ 
			-440,
			-200, 
			200, 
			480, 
			900, 
			1300, 
			1500, 
			1740, 
			1990, 
			2300, 
			2570, 
			3600
		];

		treesFront_x = 
		[ 
			-280, 
			100, 
			400, 
			600, 
			1100, 
			1400, 
			1900, 
			2400, 
			2950, 
			3500
		];

		collectables = 
		[
			{x_pos: -750, y_pos: floorPos_y -70, size: 30, isFound: false}, 
			{x_pos: 300, y_pos: floorPos_y -90, size: 30, isFound: false}, 
			{x_pos: 1800, y_pos: floorPos_y -10, size: 30, isFound: false}, 
			{x_pos: 2650, y_pos: floorPos_y -70, size: 30, isFound: false}, 
		];
		
		canyons = 
		[
			{x_pos: -3700, x2_pos: -1100 },
			{x_pos: 700, x2_pos: 800 },
			{x_pos: 2100, x2_pos: 2200 },
			{x_pos: 3100, x2_pos: 3200 }
		];
		
		
		platforms= [];
		platforms.push(createPlatforms(700,floorPos_y-90,120));
		platforms.push(createPlatforms(2100,floorPos_y-90,120));
		platforms.push(createPlatforms(3100,floorPos_y-90,120));

		endMap = [-400];

		game_score = 0 ;
		
		enemies = [];
		enemies.push(new Enemies(650, floorPos_y -20, 200));
		enemies.push(new Enemies(1650, floorPos_y -20, 2000));
		enemies.push(new Enemies(1650, floorPos_y -20, 200));
		enemies.push(new Enemies(2650, floorPos_y -20, 200));
		enemies.push(new Enemies(-650, floorPos_y -20, 3200));

		flagpole = {isReached: false, x_pos: 3900};
		
		//sound booleans
		musicLoop = false;
		completedLevel = false;
		isRunning = false;
		
		ghost = false;
	}
//--- END OF FUNCTIONS ---//