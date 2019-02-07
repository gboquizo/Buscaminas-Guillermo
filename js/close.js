{

    let init = function () {
        let btnInstructionsClose = document.getElementById("instructionsClose");
        btnInstructionsClose.addEventListener("click", () => window.close());
    }

    document.addEventListener("DOMContentLoaded", init);
}