
var GameState;
(function (GameState) {
    GameState["Play"] = "PLAY";
    GameState["LevelEnd"] = "LEVEL_END";
    GameState["GameOver"] = "GAME_OVER";
})(GameState || (GameState = {}));

const palette = [Color.Black, Color.Blue, Color.Green, Color.Indigo, Color.Red];

var currentState = GameState.Play;

let maze = [];
resetMaze();

let score = 0;
let level = 1;
let exit = { x: 0, y: 0 };
let player = {};
let exitColor = 0;
var bonus = 0;
let timeRemaining = 60; // seconds

function mazeToGrid(mazeColor) {
    for (let x = 0; x < 24; x++) {
        for (let y = 0; y < 24; y++) {
            game.setDot(x, y, maze[x][y] == 1 ? mazeColor : Color.Gray);
        }    
    }
}

function resetMaze() {
    for (let x = 0; x < 24; x++) {
        let column = [];
        for (let y = 0; y < 24; y++) {
            column[y] = 1;
        }
        maze[x] = column    
    }
}

function carveMaze(x, y) {
   
    let dir = Math.floor(Math.random() * 4);
    let cnt = dir;

    do {
    //up
    if (dir == 0 && y > 1 
        && maze[x][y-1] == 1
        && maze[x-1][y-1] == 1
        && maze[x+1][y-1] == 1
        && maze[x][y-2] == 1
        && maze[x-1][y-2] == 1
        && maze[x+1][y-2] == 1
        ) {
            y -= 1;
            maze[x][y] = 0;
            carveMaze(x,y);
    }
    //right
    if (dir == 1 && x < 22 
        && maze[x+1][y] == 1
        && maze[x+1][y-1] == 1
        && maze[x+1][y+1] == 1
        && maze[x+2][y] == 1
        && maze[x+2][y-1] == 1
        && maze[x+2][y+1] == 1
        ) {
        x += 1;
        maze[x][y] = 0;
        carveMaze(x,y);
    }
    //down
    if (dir == 2 && y < 22 
        && maze[x][y+1] == 1 
        && maze[x-1][y+1] == 1
        && maze[x+1][y+1] == 1
        && maze[x][y+2] == 1
        && maze[x-1][y+2] == 1
        && maze[x+1][y+2] == 1
        ) {
        y += 1;
    maze[x][y] = 0;
    carveMaze(x,y);
}
    //left
    if (dir == 3 && x > 1 
        && maze[x-1][y] == 1
        && maze[x-1][y-1] == 1
        && maze[x-1][y+1] == 1
        && maze[x-2][y] == 1
        && maze[x-2][y-1] == 1
        && maze[x-2][y+1] == 1
        ) {
        x -= 1;
        maze[x][y] = 0;
        carveMaze(x,y);
    }
    dir = (dir + 1) % 4;
    } while (cnt != dir);
    return;
}

function newLevel() {
    carveMaze(11,11);
    do {
        exit = {
            x: Math.floor(Math.random() * 24),
            y: Math.floor(Math.random() * 24)
        };
    } while (maze[exit.x][exit.y] == 1);
    do {
        player = {
            x: Math.floor(Math.random() * 24),
            y: Math.floor(Math.random() * 24)
        };
    } while (maze[player.x][player.y] == 1);
    timeRemaining = 60 - ((level - 1) * 5);
    flashMaze = 0;
}

function create(game) {
    newLevel();
}

function update(game) {
    mazeToGrid(palette[(level - 1) % palette.length]);

    if (currentState == GameState.Play) {
        exitColor = (exitColor + 1) % 12;
        game.setDot(exit.x, exit.y, (exitColor < 6) ? Color.Red : Color.Yellow);
                
        game.setDot(player.x, player.y, Color.Violet);
        
        if (player.x == exit.x && player.y == exit.y) {
            currentState = GameState.LevelEnd;
            bonus = timeRemaining;

        }
        game.setText(`Time: ${timeRemaining}  Score: ${score}`);
    }
    
    if (currentState == GameState.LevelEnd) {
        flashMaze = (flashMaze + 1) % palette.length;
        mazeToGrid(palette[flashMaze]);
        score = score + (level * 10);
        game.setText(`Time: ${bonus}  Score: ${score}`);
        bonus--;
        if (bonus == 0) {
            currentState = GameState.Play;
            level++;
            newLevel();
        }
    }

    if (currentState != GameState.LevelEnd && timeRemaining <= 0) {
        currentState = GameState.GameOver;
    }

    if (currentState == GameState.GameOver) {
        game.setText(`GAME OVER  Score: ${score}`);
        game.end();
    }
}

function onKeyPress(direction) {
    score += level;
    if (direction == Direction.Up && player.y > 0 && maze[player.x][player.y - 1] == 0) {
        player.y--;
    }
    if (direction == Direction.Down && player.y < 23 && maze[player.x][player.y + 1] == 0) {
        player.y++;
    }
    if (direction == Direction.Left && player.x > 0 && maze[player.x - 1][player.y] == 0) {
        player.x--;
    }
    if (direction == Direction.Right && player.x < 23 && maze[player.x + 1][player.y] == 0) {
        player.x++;
    }
}

let interval = setInterval(decreaseTimer, 1000);

function decreaseTimer() {
    timeRemaining--;
    if (timeRemaining == 0) {
        clearInterval(interval);
    }
}

let config = {
    create: create,
    update: update,
    onKeyPress: onKeyPress
};

let game = new Game(config);
game.run();
