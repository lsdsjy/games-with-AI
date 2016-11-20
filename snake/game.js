var SnakeGame = function (canvasID) {
    var Grid = function (x, y) {
        this.x = x;
        this.y = y;
    }

    Grid.prototype.compare = function (rhs) {
        return this.x == rhs.x && this.y == rhs.y;
    }

    const cx = [0, 1, 0, -1], cy = [-1, 0, 1, 0];
    const key_dir_map = {ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3};
    const width = 32, height = 32;

    var canvas = document.getElementById(canvasID);

    // user interaction
    /*document.addEventListener("keydown", (event) => {
        if (key_dir_map[event.code] !== null && Math.abs(key_dir_map[event.code] - dir) != 2)
            dir = key_dir_map[event.code];
    });*/

    var ctx = canvas.getContext('2d');

    var snake_body = [new Grid(10, 10)];
    var dir = 0;
    var food_grid;

    var timerID;

    var directions = [];

    function snakeAI() {
        function bfs(final_grid) {
            function State(grid, dir, last_state) {
                this.grid = grid;
                this.dir = dir;
                this.last_state = last_state;
            }
            function tryState(state) {
                if (!inArray(state.grid, calculated) && isLegal(state.grid)) {
                    states.push(state);
                    calculated.push(state.grid);
                }
            }
            function getDirection(state) {
                if (state.last_state.last_state == null) {
                    return state.dir;
                } else {
                    return getDirection(state.last_state);
                }
            }
            
            var states = [new State(snake_body[0], dir, null)];
            var calculated = [snake_body[0]];
            
            while (states.length) {
                var cur_state = states.shift();
                if (cur_state.grid.compare(food_grid)) {
                    return getDirection(cur_state);
                }
                if (cur_state.dir == 0 || cur_state.dir == 2) {
                    tryState(new State(nextGrid(cur_state.grid, cur_state.dir), cur_state.dir, cur_state));
                    tryState(new State(nextGrid(cur_state.grid, 1), 1, cur_state));
                    tryState(new State(nextGrid(cur_state.grid, 3), 3, cur_state));
                } else {
                    tryState(new State(nextGrid(cur_state.grid, cur_state.dir), cur_state.dir, cur_state));
                    tryState(new State(nextGrid(cur_state.grid, 0), 0, cur_state));
                    tryState(new State(nextGrid(cur_state.grid, 2), 2, cur_state));
                }
            }

            return -1;
        }

        var result = bfs(food_grid);
        if (result == -1) {
            result = bfs(snake_body[snake_body.length - 1]);
        }
        if (result == -1) {
            for (var i = 0; i < 4; i++) {
                next_grid = nextGrid(snake_body[0], i)
                if (Math.abs(i - dir) != 2 && isLegal(next_grid)) {
                    result = i;
                    break;
                }
            }
        }
        return result;
    }

    function inArray(grid, arr) {
        return arr.find(ele => ele.compare(grid));
    }

    function outOfRange(grid) {
        return grid.x < 0 || grid.y < 0 || grid.x >= width || grid.y >= height;
    }

    function isLegal(grid) {
        return !(outOfRange(grid) || inArray(grid, snake_body));
    }

    function nextGrid(grid, dir) {
        return new Grid(grid.x + cx[dir], grid.y + cy[dir]);
    }

    function genFood() {
        var x, y;
        do {
            x = Math.floor(Math.random() * 30);
            y = Math.floor(Math.random() * 30);
        } while (!isLegal(new Grid(x, y)));
        food_grid = new Grid(x, y);
    }

    function fail() {
        ctx.fillStyle = "rgba(128, 128, 128, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        window.clearInterval(timerID);
    }

    function move() {
        dir = snakeAI();
        if (dir == -1) {
            fail();
            return -1;
        }
        var next_grid = nextGrid(snake_body[0], dir);
        var last_grid = snake_body.pop();

        if (!isLegal(next_grid)) {
            fail();
            return -1;
        }

        var ret = 1;
        snake_body.unshift(next_grid);
        
        if (next_grid.compare(food_grid)) {
            ret = 2;
            genFood();
            snake_body.push(last_grid);
        }
        
        draw();

        return ret;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        snake_body.forEach((grid) => ctx.fillRect(20 * grid.x, 20 * grid.y, 20, 20));
        ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
        ctx.fillRect(20 * food_grid.x, 20 * food_grid.y, 20, 20);
    }

    return {
        start: function () {    
            genFood();
            draw();
            timerID =  window.setInterval(move, 25);
        }
    }
};

SnakeGame('snake-canvas').start();