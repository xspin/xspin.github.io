const cells = [];
const cols = 64;
const rows = 40;
var intervalId = null;

const cellsTypes = [
    "01010|10001|01010|00100",
    "0110|1001|0101|0011",
    "01111|10001|00001|10010",
    "00011000|00011000|00000000|00111100|01100110|10000001|00000000|10000001|10100101|00011000|00011000|01100110",
    "11111111|10111101|11111111",

];

function randomCells() {
    // 随机初始化元胞状态
    cells.forEach(cell => {
        if (Math.random() > 0.4) {
            cell.classList.add('alive');
            nextGeneration(cell, '1');
        }
    });
}


function initCells(x, y, s) {
    const lines = s.split('|');
    const d = Math.round(lines[0].length/2);
    x -= d;
    y -= d;
    lines.forEach((row, r) => {
        row.split('').forEach((cell, c) => {
            if (cell === '1') {
                const idx = ((x + r)%rows) * cols + ((y + c)%cols);
                if (idx >= 0 && idx < cells.length) {
                    cells[idx].classList.add('alive');
                    nextGeneration(cells[idx], '1');
                }
            }
        })
    })

}

function init() {
    const grid = document.getElementById('grid');
    const map = document.getElementById('heatmap');
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.classList.add('alive');
        cell.dataset.generation = i.toString();
        map.appendChild(cell);
    }

    for (let i = 0; i < cols * rows; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.generation = "0";
        cells.push(cell);
        grid.appendChild(cell);
    }

    randomCells();
    // initCells(rows/2, cols/2, cellsTypes[0]);
    // initCells(0, 0, cellsTypes[3]);
    // initCells(rows-10, cols-10, cellsTypes[2]);

    // 处理鼠标事件
    // grid.addEventListener('mouseover', event => {
    grid.addEventListener('click', event => {
        const targetCell = event.target;
        if (targetCell.classList.contains('cell')) {
            targetCell.classList.toggle('alive');
            nextGeneration(targetCell, '0');
        }
    });
}

function nextGeneration(cell, val = null) {
    if (val) {
        cell.dataset.generation = val;
    } else {
        let v = cell.dataset.generation;
        if (v > 8) v = 8;
        cell.dataset.generation = String(parseInt(v) + 1);
    }
}

/*
生命游戏（Game of Life）规则：
    生存条件：如果一个活细胞周围有 2 或 3 个活细胞，则该细胞在下一时刻继续存活。
    诞生条件：如果一个死细胞周围有 3 个活细胞，则该细胞在下一时刻变为活细胞。
    死亡条件：如果一个活细胞周围的活细胞少于 2 个或多于 3 个，则该细胞在下一时刻死亡
*/
function evolve() {
    const newCells = [];

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const row = Math.floor(i / cols);
        const col = i % cols;

        let aliveNeighbors = 0;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const newRow = (rows + row + dr) % rows;
                const newCol = (cols + col + dc) % cols;

                const neighbor = cells[newRow * cols + newCol];
                if (neighbor.classList.contains('alive')) {
                    aliveNeighbors++;
                }
            }
        }

        if (cell.classList.contains('alive')) {
            if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                newCells.push(false);
            } else {
                newCells.push(true);
            }
        } else {
            if (aliveNeighbors === 3) {
                newCells.push(true);
            } else {
                newCells.push(false);
            }
        }
    }

    for (let i = 0; i < cells.length; i++) {
        if (newCells[i]) {
            cells[i].classList.add('alive');
            nextGeneration(cells[i]);
        } else {
            cells[i].classList.remove('alive');
            nextGeneration(cells[i], '0');
        }
    }
}

function startEvolve() {
    if (!intervalId) {
        intervalId = setInterval(evolve, 1000);
    }
}

function stopEvolve() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

(()=>{
    init();
    startEvolve();

    const cleanBtn = document.getElementById('clean');
    cleanBtn.addEventListener('click', () => {
        cells.forEach(cell => {
            cell.classList.remove('alive');
            nextGeneration(cell, '0');
        });
    });

    const randomBtn = document.getElementById('random');
    randomBtn.addEventListener('click', () => {
        randomCells();
    });

    const startBtn = document.getElementById('start');
    startBtn.addEventListener('click', () => {
        if (intervalId) {
            stopEvolve();
            startBtn.textContent = 'START';
        } else {
            startEvolve();
            startBtn.textContent = 'PAUSE';
        }
    });

    const select = document.getElementById('typeselect');
    const options = cellsTypes.map((s, idx) => {
        s = s.substring(0, 16);
        return `<option value="${idx}">${s}</option>`;
    }).join('');
    select.innerHTML = options;
    select.style.width = '80px';
    select.style.marginLeft = '5px';
    select.addEventListener('change', (e) => {
        const idx = e.target.value;
        cleanBtn.click();
        initCells(rows/2, cols/2, cellsTypes[idx]);
    });

})();