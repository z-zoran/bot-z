
/*
let test = [];
if (!test[test.length - 1]) {
    console.log('nije');
} else {
    console.log('je');
}
*/

class Jedan {
    constructor(ime) {
        this.ime = ime;
    }
}

class Drugi extends Jedan {
    constructor(ime, dob) {
        super(ime);
        this.dob = dob;
    }
}

let neki = new Drugi('Mirko', 21);
console.log(neki.ime, + neki.dob);