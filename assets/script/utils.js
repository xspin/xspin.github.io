function updateRegulex() {
    const url = "https://jex.im/regulex/#!embed=true&flags=&re="
    const reg = document.getElementById('regulexInput').value.trim();
    if (reg) {
        const iframe = document.getElementById('regulexIframe');
        iframe.src = "";
        iframe.src = url + encodeURIComponent(reg);
    }
}
