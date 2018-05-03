
async function mozeSe(kanalica) {
    return new Promise(resolve => kanalica.on('readable', resolve));
}

async function citac(kanalica) {
    let kap = kanalica.read();
    if (kap) {
        return new Promise(resolve => resolve(kap));
    } else {
        return new Promise(resolve => {
            this.mozeSe(kanalica).then(() => {
                this.citac(kanalica).then(kap => resolve(kap));
            });
        });
    }
}

async function main() {
    console.log('begin');
    console.log((await readBytes(10)).length);
    console.log((await readBytes(65535)).length);
    console.log((await readBytes(100000)).length);
    console.log((await readBytes(10)).length);
    console.log('end');
}

main();