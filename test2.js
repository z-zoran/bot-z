let fs = require('fs');
let objekt = {}
objekt.postLimitCounter = 0;

objekt.blabla = function blaBla(podatak) {
  this.postLimitCounter += 1;
  console.log(Date.now() + ' početak funkcije ' + this.postLimitCounter);
  let counterString = (this.postLimitCounter.toString()).padStart(6, "0");
  let imeFajla = './rom/pL' + counterString + '.txt';
  let JSONiziraniPodatak = JSON.stringify(podatak);
  console.log(Date.now() + ' prije writefile');
  fs.writeFileSync(imeFajla, JSONiziraniPodatak);
  console.log(Date.now() + ' poslje writefile');
}

for (let i = 0; i < 20; i++) {
  objekt.blabla(objekt);
}



/*
function myFunc(arg) {
    console.log(`arg was => ${arg}`);
  }
  
  setInterval(myFunc, 500, 'funky');
*/