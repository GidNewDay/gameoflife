//Глобальные переменные
canvas = document.getElementById("conway");
conway = canvas.getContext("2d"); //Поле игры - объект canvas
let interval; //переменная для регулярного выполнения функции перерисовки
let size = 5; //размер клетки в пикселях
let template = false; //рисуем по шаблону?
let speed = parseInt(document.getElementById("speed").value); //скорость - время создания нового поколения
// Инициализация пустой сетки
let grid = [...Array(Math.floor(canvas.height / size))];
for (let i = 0; i < Math.floor(canvas.height / size); i++) {
  grid[i] = [...Array(Math.floor(canvas.width / size))].fill(0);
}

// Функция для рисования прямоугольника в canvas
draw = (x, y, c, s) => {
  conway.fillStyle = c;
  conway.fillRect(x, y, s, s);
};

//Функция нажатия кнопки "Старт"
document.getElementById("start").onclick = () => {
  // Определение размера сетки для игры
  const rows = parseInt(document.getElementById("field-height").value);
  const cols = parseInt(document.getElementById("field-width").value);
  document.getElementById("conway").width = cols * size;
  document.getElementById("conway").height = rows * size;

  // Создание двумерного массива для хранения сетки с новым поколением
  let nextGrid = new Array(rows);
  for (let i = 0; i < rows; i++) {
    nextGrid[i] = new Array(cols).fill(0);
  }

  // Инициализация сетки рандомными клетками
  function initializeGrid() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[i][j] = Math.floor(Math.random() * 2);
      }
    }
  }

  // Вычисление нового поколение сетки
  function computeNextGeneration() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let neighbors = countNeighbors(i, j);
        if (grid[i][j] === 1 && (neighbors < 2 || neighbors > 3)) {
          nextGrid[i][j] = 0; // Cell dies
        } else if (grid[i][j] === 0 && neighbors === 3) {
          nextGrid[i][j] = 1; // Cell is born
        } else {
          nextGrid[i][j] = grid[i][j]; // Cell stays the same
        }
      }
    }
  }

  // Кодсчитать количество живых соседей заданной клетки
  function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        let neighborRow = (row + i + rows) % rows;
        let neighborCol = (col + j + cols) % cols;
        count += grid[neighborRow][neighborCol];
      }
    }
    return count;
  }

  // Обновить сетку с новым поколением
  function updateGrid() {
    conway.clearRect(0, 0, cols * size, rows * size); //очищаем экран (координаты, размер - весь экран)
    draw(0, 0, "rgb(15, 23, 42)", cols * size); //рисуем большой экран
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        grid[x][y] = nextGrid[x][y];
        if (grid[x][y]) {
          draw(y * size, x * size, `rgb(0, ${x + 100},${y + 100})`, size); //рисуем клетку
        }
      }
    }
  }

  // Сбросить интервал перед созданием нового
  clearInterval(interval);

  if (!template) {
    initializeGrid(); //Создаем первоначальную сетку рандомно, если не нарисовали шаблон
  }

  interval = setInterval(() => {
    computeNextGeneration(); //вычисляем новое поколение,
    updateGrid(); //обновляем сетку,
  }, speed); // в интерале заданного времени (конечно же в миллисекундах :) )
};

//Функция при изменении ширины и высоты
document.getElementById("field-height").onchange = document.getElementById(
  "field-width"
).onchange = () => {
  const rows = parseInt(document.getElementById("field-height").value);
  const cols = parseInt(document.getElementById("field-width").value);

  document.getElementById("conway").width = cols * size;
  document.getElementById("conway").height = rows * size;

  //После изменения размера сетки, останавливаем игру и обновляем ранее созданную сетку
  resetGame();
  document.getElementById("template").value = ""; //сбросить шаблон

  // console.log(grid);
};

// Слушаем событие клика на canvas
canvas.onclick = (event) => {
  clearInterval(interval); //останавливаем игру

  // Получаем координаты клика x и y
  var x = event.clientX;
  var y = event.clientY;

  // Конвертируем координаты на координаты canvas
  var rect = canvas.getBoundingClientRect();
  x = x - rect.left;
  y = y - rect.top;

  // Получаем клетку координат, на которую нажали
  var cellX = Math.floor(x / size);
  var cellY = Math.floor(y / size);

  // Схраняем координаты клетки
  grid[cellY][cellX] = grid[cellY][cellX] ? 0 : 1; //если уже было нажата клетка, при повторном нажатии обнуляем элемент
  //рисуем клетку
  template = true;
  let color =
    grid[cellY][cellX] == 1
      ? `rgb(0, ${cellY + 100},${cellX + 100})`
      : "rgb(15, 23, 42)"; //при отжатии рисовать клетку цветом фона
  draw(cellX * size, cellY * size, color, size);
  // console.log(grid[cellY][cellX])
};

//Функция при изменении скорости
document.getElementById("speed").onchange = (event) => {
  resetGame();
  document.getElementById("template").value = ""; //сбросить шаблон
  speed = event.target.value;
};

document.getElementById("template").onchange = (event) => {
  // Перед началом запуска из шаблона, сбрасываем игру
  resetGame();

  // Если выбрали шаблон, рисуем из шаблона, иначе играем не по шаблону
  if (event.target.value) {
    let tmp = templates[event.target.value]; // выбор шаблона из объекта templates файла templates.js
    for (let i = 0; i < tmp.length; i++) {
      // console.log('[',tmp[i][0]+3,',', tmp[i][1]+3,']');
      grid[tmp[i][0]][tmp[i][1]] = 1;
    }
    template = true;
  } else {
    template = false;
  }

  // console.log(grid)
};

function resetGame() {
  clearInterval(interval);
  grid = [...Array(canvas.height / size)];
  for (let i = 0; i < canvas.height / size; i++) {
    grid[i] = [...Array(canvas.width / size)].fill(0);
  }
}
