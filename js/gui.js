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

/**
 * Carga la interfaz de juego.
 */
let init = function () {
    $("#seleccionNivel")[0].selectedIndex = 0;
    $('#seleccionNivel').change(buscaminasGUI.start);
    $containerLevelSelector = $("#containerLevelSelector");
    $clock = $("#clock");
    $board = $('#board');
    $time = $("time");
    $containerLevelSelector.addClass("shadowMaterialButton");
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
    },

    /**
     * Establece una serie de propiedades css al iniciar.
     */
    preloadCSS() {
        $containerLevelSelector.css("width", "100%");
        $containerLevelSelector.css("border-bottom", "2px solid #BDBDBD");
        $("#clock").css("min-width", "100px");
        $board.addClass("shadowMaterial").css("min-width", "100%");
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
            if ($("#ptotalFlags")) {
                $("#ptotalFlags").text(`${buscaminas.banderas}`)
            }
        } catch (e) {
            buscaminasGUI.uncoverMines();
            if (e.message === '¡¡¡ Enhorabuena, has ganado !!!') {
                buscaminasGUI.checkRecord();
                buscaminasGUI.levelStyles('uncover-tile', element);
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(e.message, "success");
                }, 3000);
            } else {
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
            if (buscaminas.tableroVisible[coordenada.fila][coordenada.columna] === '🏴') {
                buscaminasGUI.levelStyles('cover-flag', element);
            } else if (buscaminas.tableroPulsadas[coordenada.fila][coordenada.columna] !== '🞫') {
                buscaminasGUI.levelStyles('cover-tile', element);
            }
            if ($("#ptotalFlags")) {
                $("#ptotalFlags").text(`${buscaminas.banderas}`)
            }
        } catch (e) {
            if (e.message === "'¡¡¡ Enhorabuena, has ganado !!!'") {
                buscaminasGUI.checkRecord();
                buscaminasGUI.levelStyles('uncover-tile', element);
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(e.message, "success");
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
            }
        } catch (e) {
            buscaminasGUI.uncoverMines();
            if (e.message === '¡¡¡ Enhorabuena, has ganado !!!') {
                buscaminasGUI.levelStyles('uncover-tile', element);
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(e.message, "success");
                }, 3000);
            } else {
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

        for (const item of buscaminas.guardarAperturaCasillas) {
            let fila = parseInt(item.split('-')[0]);
            let columna = parseInt(item.split('-')[1]);
            let $element = $('#' + fila + '-' + columna);
            if (buscaminas.tableroVisible[fila][columna] !== '🏴' && buscaminas.tableroVisible[fila][columna] !== '■') {
                if (buscaminas.tableroVisible[fila][columna] === 0) {
                    $element.val('');
                } else {
                    $element.val(buscaminas.tableroVisible[fila][columna]);
                }
                buscaminasGUI.levelStyles('uncover-tile', $element);
            }
        }
        buscaminas.guardarAperturaCasillas.clear();
    },


    /**
     * Añade animaciones al input pasado por parámetro.
     * @param input elemento DOM.
     * @param classs clase css que contiene la animación.
     * @param nivel nivel actual de la partida.
     */
    animationInput(input, classs, nivel) {
        if (classs === 'cover-tile') {
            buscaminasGUI.cleanCSSClass(input);
            input.addClass(nivel + ' ' + classs);
        } else {
            buscaminasGUI.cleanCSSClass(input);
            input.addClass(nivel + ' ' + classs);
        }
    },

    /**
     * Establece una serie de clases CSS según el nivel.
     * @param classs clase que se añadirá al input.
     * @param input elemento al que se le añade la clase
     */
    levelStyles(classs, input) {
        switch (buscaminas.nivel) {
            case 'fácil':
                buscaminasGUI.animationInput(input, classs, 'easy-tile');
                break;
            case 'difícil':
                buscaminasGUI.animationInput(input, classs, 'medium-tile');
                break;
            case 'experto':
                buscaminasGUI.animationInput(input, classs, 'hard-tile');
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
            if (element.hasClass('cover-tile') || element.hasClass('cover-flag') || element.hasClass('uncover-tile')) {
                element.prop('class', '');
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
        for (let mina of buscaminas.guardarAperturaMinas) {
            let $element = $('#' + mina);
            if (buscaminas.flagGanar) {
                $element.removeClass('cover-flag') || $element.removeClass('cover-tile')
                $element.addClass('uncover-tile')
                $element.addClass('uncover-win')
            } else {
                buscaminasGUI.levelStyles(
                    colors[Math.floor(Math.random() * (colors.length - 1 - 0)) + 0],
                    $element
                );
            }
        }
    },

    /**
     * Crea un reloj
     */
    createTimer() {
        $clock.html(`<img src="images/reloj.svg" /><p id="time"></p>`);
        $time = $("#time");
    },

    /**
     * Muestra el tiempo de juego.
     */
    showGameTime() {
        let seconds = 0;
        let interval = setInterval(() => {
            if (!buscaminas.flagPerder && !buscaminas.flagGanar) {
                seconds++;
                time.textContent = seconds;
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
        let $article = $("<div></div>");
        $article.prop("id", "totalMines");
        $article.html(`<img src="images/mina.svg" height="30px"/> ${buscaminas.minas}`);
        $containerLevelSelector.append($article);
    },

    /**
     * Crea un contador con el número de banderas presentes en el tablero.
     */
    createFlagCounter() {
        let $article = $("<div></div>");
        $article.prop("id", "totalFlags");
        $article.html(`<img src="images/bandera.svg" height="30px"/><p id="ptotalFlags">${buscaminas.banderas}</p>`);
        $containerLevelSelector.append($article);
    },

    /**
     * Muestra el récord establecido en el tablero.
     */
    createRecordCounter() {
        buscaminasGUI.createTimer();
        if ($("#record")) {
            $("#record").remove();
        }
        let $article = $("<div></div>");
        $article.prop("id", "record");
        $time.html(`<div id="record"></div>`);
        if (localStorage.getItem(buscaminas.nivel) !== null) {
            $article.html(`<img src="images/record.svg" height="30px"/> ${localStorage.getItem(buscaminas.nivel)}`);
        } else {
            $article.html(`<img src="images/record.svg" height="30px"/> 0`);
        }
        $containerLevelSelector.append($article);
    },

    /**
     * Comprueba y actualiza el récord.
     */
    checkRecord() {
        let time = parseInt($("#clock p").text());
        if (localStorage.getItem(buscaminas.nivel) === null) {
            localStorage.setItem(buscaminas.nivel, time);
        } else {
            if (localStorage.getItem(buscaminas.nivel) > time) {
                localStorage.setItem(buscaminas.nivel, time);
            }
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
        $("#playAgain").append($btnPlayAgain);
        $btnPlayAgain.addClass("shadowMaterialButton");
        $("#btnPlayAgain").click(() => {
            $("#seleccionNivel")[0].selectedIndex = 0;
            location.reload();
        });
    },

    /**
     * Carga la librería sweetAlert2 para preguntar si se desea volver a jugar.
     * @param msg mensaje a mostrar.
     * @param type tipo de mensaje a mostrar.
     */
    swalPlayAgain(msg, type) {

        let gameTime = parseInt($("#clock #time").text());
        let levelRecord = buscaminasGUI.getCurrentRecord();
        let message = "";
        let title = msg;
        if (isNaN(gameTime)) {
            gameTime = 0;
        }
        if (type === "success") {
            if (levelRecord === gameTime || levelRecord > gameTime || levelRecord === null) {
                title = `${msg} \n Además has establecido el récord de este nivel en ${gameTime} segundo/s. \n\n`;
            }
        }
        message = `Tu tiempo en esta partida ha sido de ${gameTime} segundo/s. \n \n El récord actual es de ${levelRecord} segundo/s.\n \n`;
        //buscaminasGUI.playAudio("lost.mp3");
        Swal.fire({
            title: title,
            text: message + "¿Deseas jugar de nuevo?",
            type: type,
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#dc3545",
            allowOutsideClick: true,
            allowEscapeKey: true,
            allowEnterKey: true,

        }).then(result => {
            if (result.value) {
                let timerInterval;
                Swal.fire({
                    title: 'Reiniciando partida',
                    html: 'Tu partida se reiniciará en <strong></strong> segundos.',
                    type: 'info',
                    timer: 3000,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                        timerInterval = setInterval(() => {
                            Swal.getContent().querySelector('strong')
                                .textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
                        }, 100)
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                        $("#seleccionNivel")[0].selectedIndex = 0;
                        location.reload();
                    }
                })
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
            case "fácil":
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(message, "error");
                }, 4000);
                break;
            case "difícil":
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(message, "error");
                }, 8000);
                break;
            case "experto":
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(message, "error");
                }, 15000);
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
};

$(init);