// var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
var candies = ["blue-1", "orange-2", "green-2", "yellow-2", "red-2", "purple-2"];
var board = [];
var rows = 5;
var columns = 5;
var score = 0;
var gameStarted = false; // Flag to indicate if the game has started

var currTile; //candy that is clicked to drag
var otherTile; //target candy to swap with

var blueCandyMatches = 0; // Track the number of blue candy matches
var targetMatches = 10; // Target to match 10 blue candies

// Start the game - initialize and generate random candy
window.onload = function () {
    startGame();

    // Make sure the board has no initial matches
    removeInitialMatches();

    // 1/10th of a second interval for continuously checking and updating the game board
    window.setInterval(function () {
        if (gameStarted) { // Only crush candies and update if the game has started
            crushCandy();
            slideCandy();
            generateCandy();
        }
    }, 100);
}

function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

function startGame() {

    board = [];  // Reset the board to avoid appending new tiles on refresh
    document.getElementById("board").innerHTML = "";  // Clear the board HTML

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            // Create an image element for each tile
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/" + randomCandy() + ".png";

            // Add touch events for mobile
            tile.addEventListener("touchstart", touchStart); // Touch to initiate dragging
            tile.addEventListener("touchmove", touchMove);   // Move the candy
            tile.addEventListener("touchend", touchEnd);     // Release the candy to drop


            // Add drag-and-drop functionality
            tile.addEventListener("dragstart", dragStart); // Click on a candy, initialize drag process
            tile.addEventListener("dragover", dragOver);   // Clicking on candy, moving mouse to drag the candy
            tile.addEventListener("dragenter", dragEnter); // Dragging candy onto another candy
            tile.addEventListener("dragleave", dragLeave); // Leaving candy over another candy
            tile.addEventListener("drop", dragDrop);       // Dropping a candy over another candy
            tile.addEventListener("dragend", dragEnd);     // After drag process completed, swap candies

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    console.log(board);
}

// Check for any initial matches and reshuffle if necessary
function removeInitialMatches() {
    let hasMatches = true;
    while (hasMatches) {
        hasMatches = checkInitialMatches();
        //reshuffle the board
        if (hasMatches) {
            reshuffleBoard();
        }
    }
}

function reshuffleBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            board[r][c].src = "./images/" + randomCandy() + ".png";
        }
    }
}


// Check for any matches of 3 in rows or columns
function checkInitialMatches() {
    // Check rows for matches
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (candy1.src === candy2.src && candy2.src === candy3.src) {
                return true; // Found a match of 3 in a row
            }
        }
    }

    // Check columns for matches
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (candy1.src === candy2.src && candy2.src === candy3.src) {
                return true; // Found a match of 3 in a column
            }
        }
    }

    return false; // No matches found
}

function dragStart() {
    if (currTile) {
        currTile.classList.remove("scale-up"); // Remove scale from the previously selected candy
    }
    currTile = this;
    currTile.classList.add("scale-up"); // Apply scale to the selected candy
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() { }

function dragDrop() {
    otherTile = this; // Reference the tile that is being dropped on
}

function touchStart(e) {
    if (currTile) {
        currTile.classList.remove("scale-up"); // Remove scale from the previous candy
    }
    currTile = this;
    currTile.classList.add("scale-up"); // Apply scale to the selected candy
    e.preventDefault(); // Prevent the default touch behavior
}

function touchMove(e) {
    e.preventDefault(); // Prevent default scrolling behavior
    var touch = e.touches[0];
    var element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.tagName === "IMG") {
        otherTile = element;
    }
}

function touchEnd(e) {
    if (currTile && otherTile) {
        currTile.classList.remove("scale-up"); // Remove scale after swap
        handleSwap(); // Handle the candy swap logic
    }
}

function handleSwap() {
    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) {
        return;
    }

    let currCoords = currTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = c2 == c - 1 && r == r2;
    let moveRight = c2 == c + 1 && r == r2;
    let moveUp = r2 == r - 1 && c == c2;
    let moveDown = r2 == r + 1 && c == c2;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        // Swap the images between the two tiles
        let currImg = currTile.src;
        let otherImg = otherTile.src;
        currTile.src = otherImg;
        otherTile.src = currImg;

        // Validate the move and check if it leads to a valid match
        let validMove = checkValid();
        if (!validMove) {
            // If move is not valid, swap back the tiles
            currTile.src = currImg;
            otherTile.src = otherImg;
        } else {
            gameStarted = true; // The game officially starts after the first valid move
        }
    }
}

function dragEnd() {
    currTile.classList.remove("scale-up"); // Remove scale after interaction ends
    handleSwap(); // Handle the candy swap logic
}

function crushCandy() {
    crushThree();
    document.getElementById("score").innerText = score;
}

function crushThree() {
    // Check rows for matches
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];

            // Check if candies are the same and not blank
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {

                // Check if it's a blue candy match
                if (candy1.src.includes("blue-1")) {
                    blueCandyMatches += 1; // Increment blue candy match count
                    score += 100; // Award 100 points for blue candy match
                } else {
                    score += 30; // Award 30 points for other candies
                }

                // Crush the matched candies (replace with blank image)
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
            }
        }
    }

    // Check columns for matches
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];

            // Check if candies are the same and not blank
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {

                // Check if it's a blue candy match
                if (candy1.src.includes("blue-1")) {
                    blueCandyMatches += 1; // Increment blue candy match count
                    score += 100; // Award 100 points for blue candy match
                } else {
                    score += 30; // Award 30 points for other candies
                }

                // Crush the matched candies (replace with blank image)
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
            }
        }
    }

    document.getElementById("score").innerText = score; // Update the score on the screen
    checkTargetReached(); // Check if the user has reached the target of 10 blue matches
}


function checkValid() {
    // Check rows for matches
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    // Check columns for matches
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    return false;
}

function checkTargetReached() {
    if (blueCandyMatches >= targetMatches) {
        alert("Level Complete! You matched 10 blue candies!");
        // Here you can add logic to move to the next level or end the game
        gameStarted = false; // Optionally stop the game
    }
}


// Slide candies down after a crush
function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind -= 1;
            }
        }

        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./images/blank.png";
        }
    }
}

function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            board[0][c].src = "./images/" + randomCandy() + ".png";
        }
    }
}
