/**
 * Interfaz gráfica del buscaminas en jQuery
 * @author Guillermo Boquizo Sánchez.
 */

import {
    buscaminas
} from './main.js';

let $containerMenu;
let $containerLevelSelector;
let $board;
let $clock;
let $time;

let init = function () {
    $("#seleccionNivel")[0].selectedIndex = 0;
    $('#seleccionNivel').change(buscaminasGUI.start);
    $containerLevelSelector = $("#containerLevelSelector");
    $board = $('#board');
    $clock = $("#clock");
    $time = $("time");

    $containerLevelSelector.addClass("shadowMaterialButton");
};



let buscaminasGUI = {
    start() {
        buscaminas.nivel = $(this).val();
        buscaminas.init();
        $(this).prop('disabled', true);
        buscaminasGUI.generateGUIBoard();
        buscaminasGUI.disableContextMenu();
        buscaminasGUI.preloadCSS();
        buscaminasGUI.playAgain();
    },

    preloadCSS() {
        $containerLevelSelector.css("width", "100%");
        $containerLevelSelector.css("border-bottom", "2px solid #BDBDBD");
        $("#clock").css("min-width", "80px");
        $board.addClass("shadowMaterial").css("min-width", "100%");
    },

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

    picarGUI(element) {
        let coordenada = buscaminasGUI.obtenerCoordenada(element);
        try {
            buscaminas.picar(coordenada.fila, coordenada.columna);
            if (!buscaminas.flagGanar && !buscaminas.flagPerder) {
                buscaminasGUI.actualizarGui();
            }
        } catch (e) {
            buscaminasGUI.descubrirMinas();
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

    marcarGUI(element) {
        let coordenada = buscaminasGUI.obtenerCoordenada(element);
        try {
            buscaminas.marcar(coordenada.fila, coordenada.columna);
            if (buscaminas.tableroVisible[coordenada.fila][coordenada.columna] === '🏴') {
                buscaminasGUI.levelStyles('cover-flag', element);
            } else if (buscaminas.tableroPulsadas[coordenada.fila][coordenada.columna] !== '🞫') {
                buscaminasGUI.levelStyles('cover-tile', element);
            }
        } catch (e) {
            if (e.message === "'¡¡¡ Enhorabuena, has ganado !!!'") {
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(e.message, "success");
                }, 3000);
            } else {
                buscaminasGUI.openMinesByLevelAnimationTime(e.message);
            }
        }
    },

    despejarGui(element) {
        let coordenada = buscaminasGUI.obtenerCoordenada(element);
        try {
            buscaminas.despejar(coordenada.fila, coordenada.columna);
            buscaminasGUI.actualizarGui();
        } catch (e) {
            buscaminasGUI.descubrirMinas();
            if (e.message === "'¡¡¡ Enhorabuena, has ganado !!!'") {
                setTimeout(function () {
                    buscaminasGUI.swalPlayAgain(e.message, "success");
                }, 3000);
            } else {
                buscaminasGUI.openMinesByLevelAnimationTime(e.message);
            }
        }
    },

    obtenerCoordenada(element) {
        return {
            fila: parseInt(element.prop('id').split('-')[0]),
            columna: parseInt(element.prop('id').split('-')[1])
        };
    },

    actualizarGui() {
        if (buscaminas.flagPerder || buscaminas.flagGanar) {
            buscaminasGUI.descubrirMinas();
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

    animationInput(input, classs, nivel) {
        if (classs === 'cover-tile') {
            buscaminasGUI.limpiarClasesCss(input);
            input.addClass(nivel + ' ' + classs);
        } else {
            buscaminasGUI.limpiarClasesCss(input);
            input.addClass(nivel + ' ' + classs);
        }
    },

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

    limpiarClasesCss(element) {
        if (element) {
            if (element.hasClass('cover-tile') || element.hasClass('cover-flag') || element.hasClass('uncover-tile')) {
                element.prop('class', '');
            }
        }
    },

    descubrirMinas() {
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

    playAgain() {
        let $btnPlayAgain = $("<button id='btnPlayAgain'>Jugar de nuevo</button>");
        $("#playAgain").append($btnPlayAgain);
        $btnPlayAgain.addClass("shadowMaterialButton");
        $("#btnPlayAgain").click(() => {
            $("#seleccionNivel")[0].selectedIndex = 0;
            location.reload();
        });
    },

    swalPlayAgain(msg, type) {

        let message = "";
        let title = msg;

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
    }
};

$(init);