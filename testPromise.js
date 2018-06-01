
function staniMalo(koliko) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log
            resolve('Bla');
        }, koliko);
    })
}

(async () => {
    console.log(await staniMalo(2299));
})()