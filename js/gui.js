/**
 * Interfaz gráfica del buscaminas en jQuery
 * @author Guillermo Boquizo Sánchez.
 */

import {
	buscaminas
} from './main.js';

let $containerLevelSelector;
let $board;
let $clock;
let $time;
let $music;

/**
 * Carga la interfaz de juego.
 */
let init = function () {
	$('#seleccionNivel')[0].selectedIndex = 0;
	$('#seleccionNivel').change(buscaminasGUI.start);
	$('#activarMusica').click(buscaminasGUI.musicSettings);
	$('#instructions').click(buscaminasGUI.openInstructions);
	$containerLevelSelector = $('#containerLevelSelector');
	$music = $('#music');
	$clock = $('#clock');
	$board = $('#board');
	$containerLevelSelector.addClass('shadowMaterialButton');
};

/**
 * Objeto buscaminasGUI.
 */
let buscaminasGUI = {
	/**
	 * Carga el juego.
	 */
	start() {
		buscaminas.nivel = $(this).val();
		buscaminas.init();
		$(this).prop('disabled', true);
		buscaminasGUI.preloadCSS();
		buscaminasGUI.generateGUIBoard();
		buscaminasGUI.createTimer();
		buscaminasGUI.showGameTime();
		buscaminasGUI.createFlagCounter();
		buscaminasGUI.createBombsCounter();
		buscaminasGUI.createRecordCounter();
		buscaminasGUI.disableContextMenu();
		buscaminasGUI.playAgain();
		buscaminasGUI.showBoard();
		buscaminasGUI.stopMusic();
	},

	/**
	 * Establece una serie de propiedades css al iniciar.
	 */
	preloadCSS() {
		$containerLevelSelector.css('width', '100%');
		$containerLevelSelector.css('border-bottom', '2px solid #BDBDBD');
		$('#clock').css('min-width', '80px');
		$board.addClass('shadowMaterial').css('min-width', '100%');
	},

	/**
	 * Genera el tablero GUI.
	 */
	generateGUIBoard() {
		$board.css({
			display: 'grid',
			'grid-template-columns': 'repeat(' + buscaminas.columnas + ',1fr)'
		});
		let $fragment = $(document.createDocumentFragment());
		for (let i = 0; i < buscaminas.filas; i++) {
			for (let j = 0; j < buscaminas.columnas; j++) {
				let $tile = $(`<input type="text" id="${i}-${j}" readonly></input>`);
				buscaminasGUI.levelStyles('cover-tile', $tile);
				$tile.click(function () {
					buscaminasGUI.picarGUI($(this));
				});
				$tile.mousedown(function (event) {
					switch (event.buttons) {
						case 2:
							buscaminasGUI.marcarGUI($(this));
							break;
						case 3:
							buscaminasGUI.despejarGui($(this));
							break;
						default:
					}
				});
				$fragment.append($tile);
			}
		}
		$board.append($fragment);
	},

	/**
	 * Realiza la acción de picar y actualiza la GUI
	 * @param element elemento del DOM tratado.
	 */
	picarGUI(element) {
		let coordenada = buscaminasGUI.getCoordinates(element);
		try {
			buscaminas.picar(coordenada.fila, coordenada.columna);
			if (!buscaminas.flagGanar && !buscaminas.flagPerder) {
				buscaminasGUI.updateGUI();
			}
			buscaminasGUI.updateFlags();
		} catch (e) {
			buscaminasGUI.uncoverMines();
			if (e.message === '¡¡¡ Enhorabuena, has ganado !!!') {
				buscaminasGUI.checkRecord();
				buscaminasGUI.levelStyles('uncover-tile', element);
				setTimeout(function () {
					buscaminasGUI.swalPlayAgain(e.message, 'success');
				}, 3000);
			} else {
				buscaminasGUI.stopMusic();
				buscaminasGUI.playAudio('explosion.mp3');
				buscaminasGUI.openMinesByLevelAnimationTime(e.message);
			}
		}
	},

	/**
	 * Realiza la acción de marcar y actualiza la GUI
	 * @param element elemento del DOM tratado.
	 */
	marcarGUI(element) {
		let coordenada = buscaminasGUI.getCoordinates(element);
		try {
			buscaminas.marcar(coordenada.fila, coordenada.columna);
			if (!buscaminas.flagGanar && !buscaminas.flagPerder) {
				if (buscaminas.tableroVisible[coordenada.fila][coordenada.columna] === '🏴') {
					buscaminasGUI.playAudio('flag.mp3');
					buscaminasGUI.levelStyles('cover-flag', element);
				} else if (buscaminas.tableroPulsadas[coordenada.fila][coordenada.columna] !== '🞫') {
					if (buscaminas.banderas >= 1) {
						buscaminasGUI.playAudio('unflag.mp3');
					}
					buscaminasGUI.levelStyles('cover-tile', element);
				}
				buscaminasGUI.updateFlags();
			}
		} catch (e) {
			if (e.message === "'¡¡¡ Enhorabuena, has ganado !!!'") {
				buscaminasGUI.checkRecord();
				buscaminasGUI.levelStyles('uncover-tile', element);
				setTimeout(function () {
					buscaminasGUI.swalPlayAgain(e.message, 'success');
				}, 3000);
			} else {
				buscaminasGUI.openMinesByLevelAnimationTime(e.message);
			}
		}
	},

	/**
	 * Realiza la acción de despejar y actualiza la GUI
	 * @param element elemento del DOM tratado.
	 */
	despejarGui(element) {
		let coordenada = buscaminasGUI.getCoordinates(element);
		try {
			buscaminas.despejar(coordenada.fila, coordenada.columna);
			if (!buscaminas.flagGanar && !buscaminas.flagPerder) {
				buscaminasGUI.updateGUI();
				if (buscaminas.guardarSeleccionContiguas.size > 0) {
					for (let tile of buscaminas.guardarSeleccionContiguas) {
						$('#' + tile).removeClass('fadeInLeftBig');
						$('#' + tile).removeClass('rollIn');
						$('#' + tile).addClass('cover-tile-opacity', 400, () =>
							$('#' + tile).removeClass('cover-tile-opacity')
						);
					}
				}
			}
		} catch (e) {
			buscaminasGUI.uncoverMines();
			if (e.message === '¡¡¡ Enhorabuena, has ganado !!!') {
				buscaminasGUI.checkRecord();
				buscaminasGUI.levelStyles('uncover-tile', element);
				setTimeout(function () {
					buscaminasGUI.swalPlayAgain(e.message, 'success');
				}, 3000);
			} else {
				buscaminasGUI.stopMusic();
				buscaminasGUI.playAudio('explosion.mp3');
				buscaminasGUI.openMinesByLevelAnimationTime(e.message);
			}
		}
	},

	/**
	 * Permite obtener la coordenada del elemento casilla parametrizado 
	 * y devuelve un objeto con las coordenadas
	 * @param element elemento del DOM tratado como casilla.
	 */
	getCoordinates(element) {
		return {
			fila: parseInt(element.prop('id').split('-')[0]),
			columna: parseInt(element.prop('id').split('-')[1])
		};
	},

	/**
	 * Actualiza la GUI en función de los datos internos del tablero visible, 
	 * en caso de victoria o derrota descubre las minas y actualiza las clases de las casillas.
	 */
	updateGUI() {
		if (buscaminas.flagPerder || buscaminas.flagGanar) {
			buscaminasGUI.uncoverMines();
			return;
		}

		let counterDelay = 0;

		for (const item of buscaminas.guardarAperturaCasillas) {
			counterDelay++;
			let fila = parseInt(item.split('-')[0]);
			let columna = parseInt(item.split('-')[1]);
			let $element = $('#' + fila + '-' + columna);
			if (buscaminas.tableroVisible[fila][columna] !== '🏴' && buscaminas.tableroVisible[fila][columna] !== '■') {
				if (buscaminas.tableroVisible[fila][columna] === 0) {
					$element.val('');
				} else {
					$element.val(buscaminas.tableroVisible[fila][columna]);
				}
				buscaminasGUI.levelStyles('uncover-tile', $element, 'delay-' + counterDelay + 's');
			}
			if (counterDelay === 1) {
				buscaminasGUI.playAudio('abrir.mp3');
			}

		}
		buscaminas.guardarAperturaCasillas.clear();
	},

	/**
	 * Añade animaciones al input pasado por parámetro.
	 * @param input elemento DOM.
	 * @param targetClass clase css que contiene la animación.
	 * @param initialAnimation animación que se le añadirá a los input con la clase inicial.
	 * @param callbackAnimation animación que se le añadirá a los input que no tengan la clase inicial.
	 * @param level nivel actual de la partida.
	 */
	animationInput(input, targetClass, initialAnimation, callbackAnimation, level) {
		if (targetClass === 'cover-tile') {
			buscaminasGUI.cleanCSSClass(input);
			input.addClass('animated ' + initialAnimation + ' faster ' + level + ' ' + targetClass);
		} else {
			buscaminasGUI.cleanCSSClass(input);
			input.addClass('animated ' + callbackAnimation + ' faster ' + level + ' ' + targetClass);
		}
	},

	/**
	 * Establece una serie de clases CSS según el nivel.
	 * @param classs clase que se añadirá al input.
	 * @param input elemento al que se le añade la clase
	 */
	levelStyles(classs, input, delay = '') {
		switch (buscaminas.nivel) {
			case 'fácil':
				buscaminasGUI.animationInput(input, classs, 'fadeInLeftBig', 'rollIn ' + delay, 'easy-tile');
				break;
			case 'difícil':
				buscaminasGUI.animationInput(input, classs, 'fadeInLeftBig', 'rollIn ' + delay, 'medium-tile');
				break;
			case 'experto':
				buscaminasGUI.animationInput(input, classs, 'fadeInLeftBig', 'rollIn ' + delay, 'hard-tile');
				break;
			default:
				break;
		}
	},

	/**
	 * Limpia las clases del elemento pasado por parámetro.
	 * @param element elemento del DOM.
	 */
	cleanCSSClass(element) {
		if (element) {
			if (element) {
				if (element.prop('class') !== '') {
					element.prop('class', '');
				}
			}
		}
	},

	/**
	 * Descubre las minas
	 */
	uncoverMines() {
		buscaminas.eliminarBanderas();
		let colors = [
			'color1',
			'color2',
			'color3',
			'color4',
			'color5',
			'color6',
			'color7',
			'color8',
			'color9',
			'color10'
		];
		let counterDelay = 0;
		for (let mina of buscaminas.guardarAperturaMinas) {
			counterDelay++;
			let $element = $('#' + mina);
			if (buscaminas.flagGanar) {
				$element.removeClass('cover-flag') || $element.removeClass('cover-tile');
				$element.addClass('uncover-tile');
				$element.addClass('uncover-win');
			} else {
				buscaminasGUI.levelStyles(
					colors[Math.floor(Math.random() * (colors.length - 1 - 0)) + 0],
					$element,
					'delay-' + counterDelay + 's'
				);
			}
		}
	},

	/**
	 * Crea un reloj
	 */
	createTimer() {
		$clock.html(`<img src="images/reloj.svg"/><p id="time"></p>`);
		$time = $('#time');
	},

	/**
	 * Muestra el tiempo de juego.
	 */
	showGameTime() {
		let seconds = 0;
		let interval = setInterval(() => {
			if (!buscaminas.flagPerder && !buscaminas.flagGanar) {
				seconds++;
				$time.text(seconds);
			} else {
				clearInterval(interval);
				if (buscaminas.flagGanar) {
					buscaminasGUI.checkRecord();
				}
			}
		}, 1000);
	},

	/**
	 * Crea un contador con el número de bombas presentes en el tablero.
	 */
	createBombsCounter() {
		let $article = $('<div></div>');
		$article.prop('id', 'totalMines');
		$article.html(`<img src="images/mina.svg" height="30px"/> ${buscaminas.minas}`);
		$containerLevelSelector.append($article);
	},

	/**
	 * Crea un contador con el número de banderas presentes en el tablero.
	 */
	createFlagCounter() {
		let $article = $('<div></div>');
		$article.prop('id', 'totalFlags');
		$article.html(`<img src="images/bandera.svg"/><p id="ptotalFlags">${buscaminas.banderas}</p>`);
		$containerLevelSelector.append($article);
	},

	/**
	 * Muestra el récord establecido en el tablero.
	 */
	createRecordCounter() {
		buscaminasGUI.createTimer();
		if ($('#record')) {
			$('#record').remove();
		}
		let $article = $('<div></div>');
		$article.prop('id', 'record');
		if (localStorage.getItem(buscaminas.nivel) !== null) {
			$article.html(`<img src="images/record.svg"/> ${localStorage.getItem(buscaminas.nivel)}`);
		} else {
			$article.html(`<img src="images/record.svg" /> 0`);
		}
		$containerLevelSelector.append($article);
	},

	/**
	 * Comprueba y actualiza el récord.
	 */
	checkRecord() {
		let time = parseInt($('#clock p').text());
		if (localStorage.getItem(buscaminas.nivel) === null) {
			localStorage.setItem(buscaminas.nivel, time);
		} else {
			if (localStorage.getItem(buscaminas.nivel) > time) {
				localStorage.setItem(buscaminas.nivel, time);
			}
		}
	},

	/**
	 * Comprueba y actualiza el número de banderas a mostrar.
	 */
	updateFlags() {
		if ($('#ptotalFlags')) {
			$('#ptotalFlags').text(`${buscaminas.banderas}`);
		}
	},

	/**
	 * Devuelve y actualiza el récord actual del nivel. 
	 */
	getCurrentRecord() {
		if (localStorage.getItem(buscaminas.nivel) === null) {
			return 0;
		} else if (localStorage.getItem(buscaminas.nivel) > time) {
			return parseInt(localStorage.getItem(buscaminas.nivel, time));
		} else {
			return parseInt(localStorage.getItem(buscaminas.nivel));
		}
	},

	/**
	 * Crea un button para reiniciar la partida.
	 */
	playAgain() {
		let $btnPlayAgain = $("<button id='btnPlayAgain'>Jugar de nuevo</button>");
		$('#playAgain').append($btnPlayAgain);
		$btnPlayAgain.addClass('shadowMaterialButton');
		$('#btnPlayAgain').click(() => {
			$('#seleccionNivel')[0].selectedIndex = 0;
			location.reload();
		});
	},

	/**
	 * Carga la librería sweetAlert2 para preguntar si se desea volver a jugar.
	 * @param msg mensaje a mostrar.
	 * @param type tipo de mensaje a mostrar.
	 */
	swalPlayAgain(msg, type) {
		let gameTime = parseInt($('#clock #time').text());
		let levelRecord = buscaminasGUI.getCurrentRecord();
		let message = '';
		let title = msg;
		if (isNaN(gameTime)) {
			gameTime = 0;
		}
		if (type === 'success') {
			buscaminasGUI.stopMusic();
			buscaminasGUI.playAudio('win.mp3');
			if (levelRecord === gameTime || levelRecord > gameTime || levelRecord === null) {
				title = `${msg} \n Además has establecido el récord de este nivel en ${gameTime} segundo/s. \n\n`;
			}
		}
		if (type === 'error') {
			buscaminasGUI.stopMusic();
			buscaminasGUI.playAudio('lost.mp3');
		}
		message = `Tu tiempo en esta partida ha sido de ${gameTime} segundo/s. \n \n El récord actual es de ${levelRecord} segundo/s.\n \n`;
		Swal.fire({
			title: title,
			text: message + '¿Deseas jugar de nuevo?',
			type: type,
			showCancelButton: true,
			confirmButtonText: 'Sí',
			cancelButtonText: 'No',
			confirmButtonColor: '#28a745',
			cancelButtonColor: '#dc3545',
			allowOutsideClick: true,
			allowEscapeKey: true,
			allowEnterKey: true
		}).then((result) => {
			if (result.value) {
				let timerInterval;
				Swal.fire({
					title: 'Reiniciando partida',
					html: 'Tu partida se reiniciará en <strong></strong> segundos.',
					type: 'info',
					timer: 3000,
					onBeforeOpen: () => {
						Swal.showLoading();
						timerInterval = setInterval(() => {
							Swal.getContent().querySelector('strong').textContent = (Swal.getTimerLeft() /
								1000).toFixed(0);
						}, 100);
					},
					onClose: () => {
						clearInterval(timerInterval);
						$('#seleccionNivel')[0].selectedIndex = 0;
						location.reload();
					}
				});
			}
		});
	},

	/**
	 * Se encarga de gestionar el tiempo que transcurre hasta abrir una ventana modal una vez
	 * se inicia la apertura de minas, al variar su número según el nivel de dificultad.
	 * @param message mensaje a mostrar.
	 */
	openMinesByLevelAnimationTime(message) {
		switch (buscaminas.nivel) {
			case 'fácil':
				setTimeout(function () {
					buscaminasGUI.swalPlayAgain(message, 'error');
				}, 4000);
				break;
			case 'difícil':
				setTimeout(function () {
					buscaminasGUI.swalPlayAgain(message, 'error');
				}, 6000);
				break;
			case 'experto':
				setTimeout(function () {
					buscaminasGUI.swalPlayAgain(message, 'error');
				}, 11000);
				break;
			default:
				return;
		}
	},

	/**
	 * Deshabilita el menú contextual.
	 */
	disableContextMenu() {
		if ($(document).on()) {
			$(document).contextmenu(function (e) {
				e.preventDefault();
			}, false);
		} else {
			$(document).attachEvent('oncontextmenu', function () {
				$(window).event.returnValue = false;
			});
		}
	},

	/**
	 * Permite reproducir audio.
	 */
	playAudio(file) {
		let $play = new Audio();
		$play.src = './sounds/' + file;
		$play.play();
	},

	/**
	 * Muestra el tablero interno.
	 */
	showBoard() {
		let mostrarTablero = (function () {
			return {
				mostrar: () => buscaminas.mostrar()
			};
		})();
		window.buscaminas = mostrarTablero;
	},

	/**
	 * Establece la configuración de la música de fondo.
	 */
	musicSettings() {
		$music = $('#music');
		let $activateMusic = $('#activarMusica');
		$music.prop('playing', !$music.prop('playing'));
		if ($music.prop('playing')) {
			$activateMusic.prop('src', './images/stop.svg');
			$music.html('<audio controls autoplay loop> <source src="sounds/musica.mp3" type="audio/mpeg" /></audio>');
		} else {
			$activateMusic.prop('src', './images/play.svg');
			buscaminasGUI.stopMusic();
		}
	},

	/**
	 * Permite parar la música.
	 */
	stopMusic() {
		$music.html('<audio controls muted></audio>');
	},

	/**
	 * Permite mostrar las instrucciones del juego.
	 */
	openInstructions() {
		let html = `
        <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="author" content="Guillermo Boquizo Sánchez">
                <meta name="description" content="Instrucciones de juego del buscaminas">
				<meta name="keywords" content="HTML,CSS,JavaScript, jQuery, help">
				<title>Instrucciones</title></title>
				<script src="js/jquery-3.3.1.min.js"></script>
				<script type="text/javascript" src="js/close.js" charset="UTF-8"></script>
				<link rel="stylesheet" type="text/css" media="screen" href="css/estilos-instrucciones.min.css">
				<link rel="apple-touch-icon" sizes="180x180" href="icon/apple-touch-icon.png">
				<link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
				<link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
				<link rel="manifest" href="icon/site.webmanifest">
				<link rel="mask-icon" href="icon/safari-pinned-tab.svg" color="#5bbad5">
				<meta name="msapplication-TileColor" content="#da532c">
				<meta name="theme-color" content="#ffffff">
            </head>
            <body>
                <noscript>
                    <p>Por favor, comprueba que tu navegador es compatible con javascript, o bien
                    comprueba si lo tienes activado</p>
				</noscript>
				<main>
				<section class="container">
					<h1>Instrucciones de juego</h1>
					<article class="instruction">
						<p class="how-to">
						<img class="instruction-image" src="images/bloque-hover.svg" />
						Haciendo click izquierdo.
						</p>
						<p class="description">Se abren las casillas pulsando con el click izquierdo del ratón.</p>
					</article>
					<article class="instruction">
						<p class="how-to">
						<img class="instruction-image" src="images/bandera.svg" />
						Haciendo click derecho.
						</p>
						<p class="description">Se pone o quita una bandera en las casillas pulsando con el click derecho del ratón.</p>
					</article>
					<article class="instruction">
						<p class="how-to">
						<img class="instruction-image" src="images/sinbloque.svg" />
						Haciendo click izquierdo y derecho.
						</p>
						<p class="description">Advierte con una animación las casillas contiguas a una casilla abierta que pueden contener minas.</p><br/>
						<p class="description">Se comprueba, si se colocan, el número de banderas que hay alrededor.</p><br/>
						<p class="description">Si coincide con el valor de la casilla abre las contiguas.</p><br/>
						<p class="description">Si no coincide no despeja y si coincide pero erróneamente detona una bomba.</p><br/>
					</article>
					<article class="instruction">
						<p class="how-to">
						<img class="instruction-image" src="images/estrella.svg" />
						Condiciones de victoria.
						</p>
						<p class="description">Se gana si el número de casillas cubiertas coincide con el total de minas.</p>
					</article>
					<article class="instruction">
						<p class="how-to">
						<img class="instruction-image" src="images/mina.svg" />
						Condiciones de derrota.
						</p>
						<p class="description">Se pierde si se abre una casilla con mina, bien pulsando bien despejando en fallo al asignar banderas.</p>
					</article>
					<article class="instruction">
						<p class="mushroom">
						
							<img class="instruction-image" src="images/play.svg" />
							<img class="instruction-image" src="images/stop.svg" />
						
						Configuración de la música (opcional).
						</p>
						<p class="description">Si desea reproducir música durante su partida, pulse el icono de la seta verde.</p>
						<p class="description">Si desea detener la música durante su partida, pulse el icono de la seta roja.</p>
					</article>
					<button class="instructionsCloseButton" id ="instructionsClose"> Cerrar ventana </button>
				</section>
				
				</main>
            </body>
            </html>
		`
		let params = `scrollbars=yes,resizable=no,status=yes,location=yes,toolbar=yes,menubar=yes,width=700,height=800, left=1000,top=0`;
		let instructionsWindow = window.open("", "Instrucciones de juego", params);
		instructionsWindow.document.open();
		instructionsWindow.document.write(html);
		instructionsWindow.document.close();
	},

};

$(init);