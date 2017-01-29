// Cell array holds the objects for each cell div and it's attributes.
var cell = [];
// Used for algorithm to check if a cell is on the edges. I use a variable in case I want to resize the grid later. Current Position-0%gridWidth will have 0 remainder if it's on the left edge.
// Current Position-(gridWidth-1)%gridWidth will have 0 remainder if it is on the right edge.
var gridWidth = 20;
// This is false until the first time you clear a cell.
var isStarted = false;
// Stops all further cell clearing
var isGameOver = false;
// Difficulty (Easy = 50 bombs, Medium = x bombs, Hard = y bombs)
var mode = 50;
// Keep track of cleared cells
var cellCount = 0;

$(document).ready(function(){
  // Generate grid with correct div structure.
  for(i=0; i<(20*20); i++) {
    $("#grid").append("<div class='cell' id='"+i+"'></div>");
    // Set each cell's default attributes. We match each div to it's relative array object by using it's id(we could also do this by simply using .eq but I chose not to).
    cell[i] = {hidden: "yes", bomb: "no", nearby: 0, marked: "no"};
  }

  // Disable right-click menu on cells.
  $(".cell").contextmenu(function() {
    return false;
  });

  // Default mode is easy
  $("#easy").css("background-color","blue");
  $("#easy").css("color","white");


  // Cell click function. Called after they're generated to get it attached properly.
  $(".cell").mousedown(function(event){
    var x = parseInt($(this).attr("id"));
    if(event.which === 3) {
      // If cell is still hidden, call the marking function using it's position as a parameter.
      if(cell[x].hidden === "yes") {
        setMarker(x);
      }
    } else if(event.which === 1) {
      // Check for a bomb
      if(cell[x].bomb === "yes"  && !isGameOver) {
        $(this).css("background-color", "red");
        alert("You lose!");
        $("#winorlose").append("You have <span style='color:red'>LOST</span> the round! Select a difficulty to reset the grid!");
        isGameOver = true;
        return
      }
      // If this is the first time you click a cell, we call a function to setup the board.
      if(!isStarted) {
        generateBombs(mode, x);
      }
      // If the cell is hidden, call the function to check for and clear adjacent empty cells.
      if(cell[x].hidden !== "no" && !isGameOver) {
        clearCells(x);
      }
    }
  });

});


// Difficulty button
$("button").click(function(){
  var diff = $(this).attr("id");
  var diffBombs = parseInt($(this).data("count"));
  var label = $(this).data("label");
  if(!isStarted || confirm("Do you want to reset the grid with "+diff+" difficulty?")) {
    resetCells(diffBombs, diff, label);
  }
});


// Function to reset all cells to default value
function resetCells(bombcount, difficulty, label) {
 $("button").css("color", "");
 $("button").css("background-color","");
 $("#"+difficulty).css("color","white");
 $("#"+difficulty).css("background-color", "blue");
 $("#diff").html(label);
 isStarted = false;
 isGameOver = false;
 cellCount = 0;
 mode = bombcount;
 $("#winorlose").html("&nbsp");
 $(".cell").html("");
 $(".cell").css("background-color", "gray");
 for(i=0; i<gridWidth*gridWidth; i++) {
    cell[i] = {hidden: "yes", bomb: "no", nearby: 0, marked: "no"};
 }

}



// Cell marking function
function setMarker(b) {
  if(cell[b].marked === "no") {
    $("#"+b).html("!");
    cell[b].marked = "!";
    return;
  } else if(cell[b].marked === "!") {
    $("#"+b).html("?");
    cell[b].marked = "?";
    return;
  } else if(cell[b].marked === "?")
    $("#"+b).html("");
    cell[b].marked = "no";
    return;
}

// Bomb generating function
function generateBombs(bombs, current) {
  isStarted = true;
  // Counter to keep track of how many bombs we generate.
  var counter = 0;
  // Continue to generate bombs until the amount equals the bombs parameter.
  while(counter < bombs) {
    // randomly generate number from 0 to 399 and set it to x
    var n = Math.floor(Math.random()*400);
    // If the object in cell[x] has no bomb, set the bomb to yes and counter++.
    if(cell[n].bomb === "no" && n !== current) {
      counter += 1;
      cell[n].bomb = "yes";

      // Add +1 to the nearby attribute of all adjacent cells.
      // Left
      if(n%gridWidth !== 0) {
        cell[n-1].nearby += 1;
      }

      // Right
      if((n-(gridWidth-1))%gridWidth !== 0) {
        cell[n+1].nearby += 1;
      }

      // Up
      if(n > gridWidth-1) {
        cell[n-20].nearby += 1;
      }

      // Down
      if(n < gridWidth*gridWidth-gridWidth) {
        cell[n+20].nearby += 1;
      }

      // Up-right
      if(n > gridWidth-1 && n-(gridWidth-1)%gridWidth !== 0) {
        cell[n-20+1].nearby += 1;
      }

      // Up-left
      if(n > gridWidth -1 && n%gridWidth !== 0) {
        cell[n-20-1].nearby += 1;
      }

      // Down-right
      if(n < 380 && (n-(gridWidth-1))%gridWidth !== 0) {
        cell[(n+gridWidth+1)].nearby += 1;
      }

      // Down-left
      if(n < 380 && n%gridWidth !== 0) {
        cell[(n+gridWidth-1)].nearby += 1;
      }
    }
  }
}

// Cell clearing function
function clearCells(pos) {
  // Clear the div/cell.
  $("#"+pos).css("background-color", "white");
  // Increase a global variable to count how many cells we have cleared.
  cellCount += 1;
  // If the amount of cells cleared equals the size of the grid minus the amount of bombs, you win!
  if(cellCount === gridWidth*gridWidth-mode) {
    alert("You win!");
    $("#winorlose").append("You have <span style='color:green'>WON</span> the round! Select a difficulty to reset the grid!");
    isGameOver = true;
  }
  // Set the amount of nearby bombs to it's HTML by pulling the value of "nearby" from it's related object.
  var n = cell[pos].nearby;
  if(n === 0) {
    $("#"+pos).html("");
  } else if(n === 1) {
    $("#"+pos).html("<span style='color:blue'>"+n+"</span>");
  } else if(n === 2 ) {
    $("#"+pos).html("<span style='color:green'>"+n+"</span>");
  } else if(n >= 3) {
    $("#"+pos).html("<span style='color:red'>"+n+"</span>");
  }

  // Set it's related object to hidden = no.
  cell[pos].hidden = "no";

  if(cell[pos].nearby === 0) {

    //Left
    if(pos%gridWidth !== 0 && cell[pos-1].hidden === "yes") {
       clearCells(pos-1);
    }

    //Right
    if((pos-(gridWidth-1))%gridWidth !== 0 && cell[pos+1].hidden === "yes") {
       clearCells(pos+1);
    }

    // Up
    if(pos > gridWidth-1 && cell[pos-gridWidth].hidden === "yes") {
       clearCells(pos-gridWidth);
    }

    // Down
    if(pos < gridWidth*gridWidth-gridWidth && cell[pos+gridWidth].hidden === "yes") {
       clearCells(pos+gridWidth);
    }
    
    // Down right
    if(pos < gridWidth*gridWidth-gridWidth && (pos-(gridWidth-1))%gridWidth !== 0 && cell[pos+gridWidth+1].hidden === "yes") { 
       clearCells(pos+gridWidth+1);
    }
    
    //Down left
    if(pos < gridWidth*gridWidth-gridWidth && pos%gridWidth !== 0 && cell[pos+gridWidth-1].hidden === "yes") {
      clearCells(pos+gridWidth-1);
    }

    // Up right diag
    if((pos-(gridWidth-1))%gridWidth !== 0 && pos > gridWidth-1 && cell[pos-gridWidth+1].hidden === "yes") {
       clearCells(pos-gridWidth+1);
    }

    // Up-left diag
    if((pos-0)%gridWidth !== 0 && pos > gridWidth-1 && cell[pos-gridWidth-1].hidden === "yes") {
       clearCells(pos-gridWidth-1);
    }

  }
}