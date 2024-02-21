const buttonShares = document.querySelectorAll('.table-button-share');

buttonShares.forEach((buttonShare) => {
    buttonShare.addEventListener("click", function() {
        const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + this.getAttribute("data-short-url");
        window.open(facebookUrl, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250');
    });
})