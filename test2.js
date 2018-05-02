
function nullBrisalo(array, duljina) {

    // onda čistimo null arrayeve (ostatke starih stopova)
    for (let c in chartData.m1.pozStopovi) {
        let ovajArray = chartData.m1.pozStopovi[c];
        let ovoJeNullArr = true;
        // krećemo s pretpostavkom da je null array, ako nije onda idemo na sljedeći
        for (let i = 0; i < ovajArray.length; i++) {
            if (ovajArray[i] !== null) {
                ovoJeNullArr = false;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.pozStopovi[c];
        }
    }

    // onda čistimo null arrayeve (ostatke starih trailera)
    for (let c in chartData.m1.traileri) {
        let ovajArray = chartData.m1.traileri[c];
        let ovoJeNullArr = true;
        // krećemo s pretpostavkom da je null array, ako nije onda idemo na sljedeći
        for (let i = 0; i < ovajArray.length; i++) {
            if (ovajArray[i] !== null) {
                ovoJeNullArr = false;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.traileri[c];
            // ako brišemo trailer, znači da nam netreba više ulazna cijena i izmišljena boja
            delete chartData.boje[c];
            delete chartData.ulazneCijene[c];
        }
    }
}