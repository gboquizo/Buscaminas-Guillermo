/**
 * Funcionalidad del buscaminasMain por consola.
 * @author Guillermo Boquizo Sánchez.
 */
{
	/**
	 * Constantes para los mensajes de las exception.
	 */
	const msgGanar = "¡¡¡ Enhorabuena, has ganado !!!";
	const msgPerder = "Pulsaste una mina, has perdido";
	const msgCoordenadaNoValida = "Coordenadas inválidas.";

	/**
	 * Objeto buscaminasMain.
	 */
	let buscaminasMain = {
		tableroLogica: [],
		tableroCopia: [],
		tableroVisible: [],
		tableroPulsadas: [],
		nivel: '',
		filas: 0,
		columnas: 0,
		minas: 0,
		banderas: 0,
		flagPerder: false,
		flagGanar: false,
		guardarAperturaCasillas: new Set(),
		guardarAperturaMinas: new Set(),
		guardarCoordenadasBanderas: new Set(),
		guardarSeleccionContiguas: new Set(),

		/**
		 * Realiza la carga inicial de la funcionalidad del buscaminasMain.
		 */
		init() {
			buscaminasMain.flagPerder = false;
			buscaminasMain.flagGanar = false;
			buscaminasMain.seleccionarNivel();
			buscaminasMain.instrucciones();
			buscaminasMain.generarTableros();
			buscaminasMain.generarMinas();
			buscaminasMain.cargarNumeros();
		},

		/**
		 * Permite seleccionar el nivel de juego.
		 */
		seleccionarNivel() {
			switch (buscaminasMain.nivel.toLowerCase()) {
				case 'fácil':
					buscaminasMain.filas = 8;
					buscaminasMain.columnas = 8;
					buscaminasMain.minas = 10;
					buscaminasMain.banderas = 10;
					break;
				case 'difícil':
					buscaminasMain.filas = 16;
					buscaminasMain.columnas = 16;
					buscaminasMain.minas = 40;
					buscaminasMain.banderas = 40;
					break;
				case 'experto':
					buscaminasMain.filas = 16;
					buscaminasMain.columnas = 20;
					buscaminasMain.minas = 99;
					buscaminasMain.banderas = 99;
					break;
				default:
					break;
			}
		},

		/**
		 * Muestra las instrucciones de juego del buscaminasMain. 
		 */
		instrucciones() {
			console.clear();
			let newline = '\n';
			console.log(
				'Bienvenido al buscaminasMain.' +
				newline +
				'Para jugar utiliza la interfaz gráfica:' +
				newline +
				'Para picar, simplemente haz click izquierdo en una casilla' +
				newline +
				'Para poner o quitar una bandera, haz click derecho.' +
				newline +
				'Para despejar una casilla, haz click con ambos botones en una casilla' +
				newline +
				'previamente picada, una vez hayas marcado las minas próximas,' +
				'lo que despejará una casilla con banderas en sus proximidades.' +
				newline +
				'Para ver el tablero escribe buscaminasMain.mostrar()'
			);
		},

		/**
		 * Muestra los tableros al cargar.
		 */
		mostrar() {
			console.clear();
			console.log('Tablero de lógica:\n');
			console.table(buscaminasMain.tableroLogica);
		},

		/**
		 * Genera los tableros y los inicializa con valores por defecto.
		 */
		generarTableros() {
			for (let i = 0; i < buscaminasMain.filas; i++) {
				buscaminasMain.tableroLogica[i] = [];
				buscaminasMain.tableroVisible[i] = [];
				buscaminasMain.tableroCopia[i] = [];
				buscaminasMain.tableroPulsadas[i] = [];
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					buscaminasMain.tableroLogica[i][j] = 0;
					buscaminasMain.tableroVisible[i][j] = '■';
					buscaminasMain.tableroCopia[i][j] = 0;
					buscaminasMain.tableroPulsadas[i][j] = 'NP';
				}
			}
		},

		/**
		 * Genera y coloca las minas.
		 */
		generarMinas() {
			for (let i = 0; i < buscaminasMain.minas; i++) {
				let fila;
				let columna;
				do {
					fila = Math.floor(Math.random() * (buscaminasMain.filas - 1 - 0) + 0);
					columna = Math.floor(Math.random() * (buscaminasMain.columnas - 1 - 0) + 0);
				}
				while (buscaminasMain.tableroLogica[fila][columna] === '💣');
				buscaminasMain.tableroLogica[fila][columna] = '💣';
				buscaminasMain.tableroCopia[fila][columna] = '💣';
				buscaminasMain.guardarAperturaMinas.add(fila + '-' + columna);
			}
		},

		/**
		 * Carga los números en función de las minas cercanas.
		 */
		cargarNumeros() {
			for (let i = 0; i < buscaminasMain.filas; i++) {
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					if (buscaminasMain.tableroLogica[i][j] === '💣') {
						if (i == 0 && j == 0) {
							buscaminasMain.contarMinas(i, j, i + 1, j + 1);
						} else if (i == 0 && (j > 0 && j < buscaminasMain.minas - 1)) {
							buscaminasMain.contarMinas(i, j - 1, i + 1, j + 1);
						} else if (i == 0 && j == buscaminasMain.minas - 1) {
							buscaminasMain.contarMinas(i, j - 1, i + 1, j);
						} else if (j == buscaminasMain.minas - 1 && (i > 0 && i < buscaminasMain.minas - 1)) {
							buscaminasMain.contarMinas(i - 1, j - 1, i + 1, j);
						} else if (i == buscaminasMain.minas - 1 && j == buscaminasMain.minas - 1) {
							buscaminasMain.contarMinas(i - 1, j - 1, i, j);
						} else if (i == buscaminasMain.minas - 1 && (j > 0 && j < buscaminasMain.minas - 1)) {
							buscaminasMain.contarMinas(i - 1, j - 1, i, j + 1);
						} else if (i == buscaminasMain.minas - 1 && j == 0) {
							buscaminasMain.contarMinas(i - 1, j, i, j + 1);
						} else if (j == 0 && (i > 0 && i < buscaminasMain.minas - 1)) {
							buscaminasMain.contarMinas(i - 1, j, i + 1, j + 1);
						} else {
							buscaminasMain.contarMinas(i - 1, j - 1, i + 1, j + 1);
						}
					}
				}
			}
		},

		/**
		 * Cuenta y coloca el número de minas.
		 * @param inicioFila - Inicio de la fila.
		 * @param inicioColumna - Inicio de la columna.
		 * @param finFila - Fin de la fila.
		 * @param finColumna - Fin de la columna.
		 */
		contarMinas(inicioFila, inicioColumna, finFila, finColumna) {
			for (let i = inicioFila; i <= finFila; i++) {
				for (let j = inicioColumna; j <= finColumna; j++) {
					if (buscaminasMain.tableroLogica[i][j] !== '💣') {
						if (buscaminasMain.tableroLogica[i][j] === '0') {
							buscaminasMain.tableroLogica[i][j] = 0 + 1;
							buscaminasMain.tableroCopia[i][j] = 0 + 1;
						} else {
							buscaminasMain.tableroLogica[i][j] = parseInt(buscaminasMain.tableroLogica[i][j]) + 1;
							buscaminasMain.tableroCopia[i][j] = parseInt(buscaminasMain.tableroLogica[i][j]);
						}
					}
				}
			}
		},

		/**
		 * Pica una casilla.
		 * @param  x coordenada para la fila.
		 * @param  y coordenada para la columna.
		 */
		picar(x, y) {
			if (x > buscaminasMain.filas || y > buscaminasMain.columnas) {
				throw new Error(msgCoordenadaNoValida);
			}
			if (
				!buscaminasMain.juegoNoFinalizado() ||
				buscaminasMain.tableroPulsadas[x][y] === '🞫' ||
				buscaminasMain.tableroVisible[x][y] === '🏴'
			) {
				return;
			}

			if (buscaminasMain.tableroLogica[x][y] === '💣') {
				buscaminasMain.flagPerder = true;
				throw new Error(msgPerder);
			}

			buscaminasMain.abrirCeros(x, y);
			buscaminasMain.cargarPulsacion(x, y);
			buscaminasMain.actualizaCambios();
			// console.clear();
			// console.log('Tablero de lógica:\n');
			// console.table(buscaminasMain.tableroLogica);
			// console.log('Tablero visible:\n');
			// console.table(buscaminasMain.tableroVisible);
			// console.log('Tablero pulsadas:\n');
			// console.table(buscaminasMain.tableroPulsadas);
			buscaminasMain.comprobarGanador();
		},

		/**
		 * Descubre las casillas, mediante recursividad.
		 * @param x coordenada para la fila.
		 * @param y coordenada para la columna.
		 */
		abrirCeros(x, y) {
			if (buscaminasMain.tableroCopia[x][y] !== 0) {
				if (buscaminasMain.tableroVisible[x][y] === '🏴' && buscaminasMain.tableroPulsadas[x][y] === '🞫') {
					buscaminasMain.tableroVisible[x][y] = buscaminasMain.tableroCopia[x][y];
					buscaminasMain.banderas++;
				}
			}
			if (buscaminasMain.tableroCopia[x][y] === 0) {
				buscaminasMain.tableroCopia[x][y] = -1;
				if (buscaminasMain.tableroLogica[x][y] === 0) {
					if (buscaminasMain.tableroVisible[x][y] === '🏴' && buscaminasMain.tableroPulsadas[x][y] === '🞫') {
						buscaminasMain.tableroVisible[x][y] = buscaminasMain.tableroCopia[x][y] + 1;
						buscaminasMain.banderas++;
					}
					for (let j = Math.max(x - 1, 0); j <= Math.min(x + 1, buscaminasMain.filas - 1); j++) {
						for (let k = Math.max(y - 1, 0); k <= Math.min(y + 1, buscaminasMain.columnas - 1); k++) {
							buscaminasMain.cargarPulsacion(j, k);
							buscaminasMain.abrirCeros(j, k);
						}
					}
				}
			}
		},

		/**
		 * Carga las casillas pulsadas en su correspondiente matriz.
		 * @param x coordenada para la fila.
		 * @param  y coordenada para la columna.
		 */
		cargarPulsacion(x, y) {
			buscaminasMain.tableroPulsadas[x][y] = '🞫';
			buscaminasMain.guardarAperturaCasillas.add(x + '-' + y);
		},

		/**
		 * Actualiza los cambios en el tablero visible.
		 */
		actualizaCambios() {
			for (let i = 0; i < buscaminasMain.filas; i++) {
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					if (
						buscaminasMain.tableroPulsadas[i][j] === '🞫' &&
						(buscaminasMain.tableroVisible[i][j] === '■' || buscaminasMain.tableroVisible[i][j] === '🏴')
					) {
						buscaminasMain.tableroVisible[i][j] = buscaminasMain.tableroLogica[i][j];
					}
				}
			}
		},

		/**
		 * Marca y desmarca una casilla con una bandera.
		 *
		 * @param x coordenada para la fila.
		 * @param y coordenada para la columna.
		 */
		marcar(x, y) {
			if (x > buscaminasMain.filas || y > buscaminasMain.columnas) {
				throw new Error(msgCoordenadaNoValida);
			}
			if (
				buscaminasMain.tableroPulsadas[x][y] !== '🞫' &&
				buscaminasMain.tableroVisible[x][y] !== '🏴' &&
				buscaminasMain.juegoNoFinalizado()
			) {
				if (buscaminasMain.banderas > 0) {
					buscaminasMain.tableroVisible[x][y] = '🏴';
					buscaminasMain.banderas--;
					// console.clear();
					// console.log('Tablero de lógica:\n');
					// console.table(buscaminasMain.tableroLogica);
					// console.log('Tablero visible:\n');
					// console.table(buscaminasMain.tableroVisible);
					// console.log('Tablero pulsadas:\n');
					// console.table(buscaminasMain.tableroPulsadas);
					// console.log(buscaminasMain.banderas);
				}
			} else if (buscaminasMain.tableroPulsadas[x][y] !== '🞫' && buscaminasMain.tableroVisible[x][y] === '🏴') {
				buscaminasMain.tableroVisible[x][y] = '■';
				buscaminasMain.banderas++;
				// console.clear();
				// console.log('Tablero de lógica:\n');
				// console.table(buscaminasMain.tableroLogica);
				// console.log('Tablero visible:\n');
				// console.table(buscaminasMain.tableroVisible);
				// console.log('Tablero pulsadas:\n');
				// console.table(buscaminasMain.tableroPulsadas);
				// console.log(buscaminasMain.banderas);
			}
			buscaminasMain.comprobarGanadorConBanderas();
		},

		/**
		 * Intenta destapar las casillas colindantes, sólo si el número de banderas
		 * se corresponden con las que indica la casilla. Entonces muestra el campo
		 * de minas actualizado.
		 * En caso de estar las banderas equivocadas se indica que se ha perdido el
		 * juego.
		 * @param x coordenada para la fila.
		 * @param y coordenada para la columna.
		 */
		despejar(x, y) {
			buscaminasMain.guardarSeleccionContiguas.clear();
			if (x > buscaminasMain.filas || y > buscaminasMain.columnas) {
				throw new Error(msgCoordenadaNoValida);
			}

			if (!buscaminasMain.juegoNoFinalizado()) {
				return;
			}

			if (buscaminasMain.obtenerBanderasAlrededor(x, y) === buscaminasMain.tableroLogica[x][y]) {
				if (
					x > 0 &&
					y > 0 &&
					(buscaminasMain.tableroVisible[x - 1][y - 1] !== '🏴' && buscaminasMain.tableroPulsadas[x - 1][y - 1] !== '🞫')
				) {
					buscaminasMain.picar(x - 1, y - 1);
				}
				if (
					y > 0 &&
					(buscaminasMain.tableroVisible[x][y - 1] !== '🏴' && buscaminasMain.tableroPulsadas[x][y - 1] !== '🞫')
				) {
					buscaminasMain.picar(x, y - 1);
				}
				if (
					y > 0 &&
					x < buscaminasMain.filas - 1 &&
					(buscaminasMain.tableroVisible[x + 1][y - 1] !== '🏴' && buscaminasMain.tableroPulsadas[x + 1][y - 1] !== '🞫')
				) {
					buscaminasMain.picar(x + 1, y - 1);
				}
				if (
					x > 0 &&
					(buscaminasMain.tableroVisible[x - 1][y] !== '🏴' && buscaminasMain.tableroPulsadas[x - 1][y] !== '🞫')
				) {
					buscaminasMain.picar(x - 1, y);
				}
				if (
					x < buscaminasMain.filas - 1 &&
					(buscaminasMain.tableroVisible[x + 1][y] !== '🏴' && buscaminasMain.tableroPulsadas[x + 1][y] !== '🞫')
				) {
					buscaminasMain.picar(x + 1, y);
				}
				if (
					y < buscaminasMain.columnas - 1 &&
					(buscaminasMain.tableroVisible[x][y + 1] !== '🏴' && buscaminasMain.tableroPulsadas[x][y + 1] !== '🞫')
				) {
					buscaminasMain.picar(x, y + 1);
				}
				if (
					x < buscaminasMain.filas - 1 &&
					y < buscaminasMain.columnas - 1 &&
					(buscaminasMain.tableroVisible[x + 1][y + 1] !== '🏴' && buscaminasMain.tableroPulsadas[x + 1][y + 1] !== '🞫')
				) {
					buscaminasMain.picar(x + 1, y + 1);
				}
				if (
					x > 0 &&
					y < buscaminasMain.columnas - 1 &&
					(buscaminasMain.tableroVisible[x - 1][y + 1] !== '🏴' && buscaminasMain.tableroPulsadas[x - 1][y + 1] !== '🞫')
				) {
					buscaminasMain.picar(x - 1, y + 1);
				}
			} else {
				buscaminasMain.guardarSeleccionContiguas.clear();
				if (
					x > 0 &&
					y > 0 &&
					(buscaminasMain.tableroVisible[x - 1][y - 1] !== '🏴' && buscaminasMain.tableroPulsadas[x - 1][y - 1] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x - 1 + '-' + (y - 1));
				}
				if (
					y > 0 &&
					(buscaminasMain.tableroVisible[x][y - 1] !== '🏴' && buscaminasMain.tableroPulsadas[x][y - 1] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x + '-' + (y - 1));
				}
				if (
					y > 0 &&
					x < buscaminasMain.filas - 1 &&
					(buscaminasMain.tableroVisible[x + 1][y - 1] !== '🏴' && buscaminasMain.tableroPulsadas[x + 1][y - 1] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x + 1 + '-' + (y - 1));
				}
				if (
					x > 0 &&
					(buscaminasMain.tableroVisible[x - 1][y] !== '🏴' && buscaminasMain.tableroPulsadas[x - 1][y] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x - 1 + '-' + y);
				}
				if (
					x < buscaminasMain.filas - 1 &&
					(buscaminasMain.tableroVisible[x + 1][y] !== '🏴' && buscaminasMain.tableroPulsadas[x + 1][y] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x + 1 + '-' + y);
				}
				if (
					y < buscaminasMain.columnas - 1 &&
					(buscaminasMain.tableroVisible[x][y + 1] !== '🏴' && buscaminasMain.tableroPulsadas[x][y + 1] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x + '-' + (y + 1));
				}
				if (
					x < buscaminasMain.filas - 1 &&
					y < buscaminasMain.columnas - 1 &&
					(buscaminasMain.tableroVisible[x + 1][y + 1] !== '🏴' && buscaminasMain.tableroPulsadas[x + 1][y + 1] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x + 1 + '-' + (y + 1));
				}
				if (
					x > 0 &&
					y < buscaminasMain.columnas - 1 &&
					(buscaminasMain.tableroVisible[x - 1][y + 1] !== '🏴' && buscaminasMain.tableroPulsadas[x - 1][y + 1] !== '🞫')
				) {
					buscaminasMain.guardarSeleccionContiguas.add(x - 1 + '-' + (y + 1));
				}
			}
		},

		/**
		 * Obtiene el numero de banderas de las casillas de alrededor de la casilla pasada por parámetro
		 * @param x coordenada de la fila
		 * @param y coordenada de la columna
		 */
		obtenerBanderasAlrededor(x, y) {
			let totalBanderas = 0;
			if (buscaminasMain.tableroPulsadas[x][y] === '🞫') {
				if (x > 0 && y > 0 && buscaminasMain.tableroVisible[x - 1][y - 1] === '🏴') {
					totalBanderas++;
				}

				if (y > 0 && buscaminasMain.tableroVisible[x][y - 1] === '🏴') {
					totalBanderas++;
				}

				if (y > 0 && x < buscaminasMain.filas - 1 && buscaminasMain.tableroVisible[x + 1][y - 1] === '🏴') {
					totalBanderas++;
				}

				if (x > 0 && buscaminasMain.tableroVisible[x - 1][y] === '🏴') {
					totalBanderas++;
				}

				if (x < buscaminasMain.filas - 1 && buscaminasMain.tableroVisible[x + 1][y] === '🏴') {
					totalBanderas++;
				}

				if (y < buscaminasMain.columnas - 1 && buscaminasMain.tableroVisible[x][y + 1] === '🏴') {
					totalBanderas++;
				}

				if (
					x < buscaminasMain.filas - 1 &&
					y < buscaminasMain.columnas - 1 &&
					buscaminasMain.tableroVisible[x + 1][y + 1] === '🏴'
				) {
					totalBanderas++;
				}

				if (x > 0 && buscaminasMain.columnas - 1 && buscaminasMain.tableroVisible[x - 1][y + 1] === '🏴') {
					totalBanderas++;
				}
			}
			return totalBanderas;
		},

		/**
		 * Comprueba si se gana de manera convencional.
		 */
		comprobarGanador() {
			if (buscaminasMain.obtenerPulsadas() === buscaminasMain.obtenerPendientesParaGanar()) {
				buscaminasMain.flagGanar = true;
				buscaminasMain.eliminarBanderas();
				throw new Error(msgGanar);
			}
		},

		/**
		 * Devuelve el número de casillas pulsadas en el tablero.
		 */
		obtenerPulsadas() {
			let contador = 0;
			for (let i = 0; i < buscaminasMain.filas; i++) {
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					if (buscaminasMain.tableroPulsadas[i][j] === '🞫') {
						contador++;
					}
				}
			}
			return contador;
		},

		/**
		 * Devuelve el número de casillas que deben quedar pendientes para ganar del tablero.
		 */
		obtenerPendientesParaGanar() {
			let contador = 0;
			for (let i = 0; i < buscaminasMain.filas; i++) {
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					if (buscaminasMain.tableroLogica[i][j] !== '💣') {
						contador++;
					}
				}
			}
			return contador;
		},

		/**
		 * Devuelve el número de banderas del tablero.
		 */
		obtenerBanderasDelTablero() {
			let banderas = 0;
			for (let i = 0; i < buscaminasMain.filas; i++) {
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					if (buscaminasMain.tableroVisible[i][j] === '🏴') {
						banderas++;
					}
				}
			}
			return banderas;
		},

		/**
		 * Guarda las banderas en un set para eliminarlas desde el contador de banderas.
		 */
		eliminarBanderas() {
			for (let i = 0; i < buscaminasMain.filas; i++) {
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					if (buscaminasMain.tableroVisible[i][j] === '🏴') {
						buscaminasMain.guardarCoordenadasBanderas.add(i + '-' + j);
					}
				}
			}
		},

		/**
		 * Comprueba si se ha ganado mediante el uso de banderas.
		 */
		comprobarGanadorConBanderas() {
			let casillasNoPulsadas = 0;
			let casillasYaPulsadas = 0;
			let casillasParaGanar = 0;
			for (let i = 0; i < buscaminasMain.filas; i++) {
				for (let j = 0; j < buscaminasMain.columnas; j++) {
					if (buscaminasMain.tableroPulsadas[i][j] === '🞫') {
						casillasYaPulsadas++;
					}
					if (buscaminasMain.tableroPulsadas[i][j] !== '🞫') {
						casillasNoPulsadas++;
						if (
							casillasNoPulsadas === buscaminasMain.minas &&
							(buscaminasMain.tableroLogica[i][j] === '💣' && buscaminasMain.tableroVisible[i][j] === '🏴')
						) {
							casillasParaGanar++;
						}
					}
				}
			}
			if (casillasYaPulsadas > 1 && casillasParaGanar === buscaminasMain.minas) {
				buscaminasMain.flagGanar = true;
				buscaminasMain.eliminarBanderas();
				//throw new Error('Has ganado la partida');
			}
		},

		/**
		 * Comprueba que el juego no haya finalizado.
		 */
		juegoNoFinalizado() {
			return !buscaminasMain.flagGanar && !buscaminasMain.flagPerder;
		}
	};

	/**
	 * Closure del objeto buscaminas.
	 */
	buscaminas = (function () {
		return buscaminasMain;
	})();

	/**
	 * Closure de las constantes para los mensajes.
	 */
	buscaminasMainMsg = (function () {
		return {
			"msgGanar": msgGanar,
			"msgPerder": msgPerder,
			"msgCoordenadaNoValida": msgCoordenadaNoValida
		}
	})();
}