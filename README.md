# bot-z

## klasnaBorba.js

Glavni library sa svim klasama i metodama.

Neka osnovna logika je slijedeća:
- Portfolio postavlja/ubija limitOrdere.
	(njihova vrijednost se insta oduzima/dodaje portfoliju)
	- LimitOrderi kod triggeranja se samo-ubijaju i stvaraju Poziciju koja pamti svoj stop trigger
		- kad se triggera stop trigger, briše se stop trigger i stvara Trailer.
			- Trailer se kod triggeranja samo-ubija, ubija i Poziciju i hrani njen iznos natrag u Portfolio.
Ubačene su i kompozitne metode, pa se cijeli portfolio može samo-čekirati bez previše filozofije.

Klase i metode su:

### `Portfolio`
Klasa koju instanciramo u sklopu strategije.
End-game je mnogo instanci, svaka sa svojom strategijom (ili s istim strategijama).
Metode dijelimo na elementarne i kompozitne:

elementarne:
#### `.postLimit(limitData)`
#### `.ubiLimit(koji)`
#### `.postPoziciju(koja, odmakPhi)`

kompozitne:
#### `.provjeriStopove(cijenaSad, odmakTau)`
#### `.provjeriLimite`
#### `.korigirajLimite`
#### `.provjeriTrailere(cijenaSad)`
#### `.obaviKillove(cijenaSad, koefKappa)`

### `LimitOrder`
Klasa za Limit order (buy ili sell).

### `Pozicija`
Klasa za Poziciju (izvršeni Limit order).

#### `.stopTriggeran(odmak)`
#### `.likvidacija(cijenaSad)`
#### `.stopCheck(cijenaSad, odmakTau)`
#### `.killCheck(cijenaSad, koefKappa)`

### `Trailer`
Klasa za trailing stop.

#### `.trailerKorekcija(cijenaSad)`




### Memorija
U modulu `memorija.js` držimo trčuću memoriju svih portfolija i njihovih pozicija, limita, trailera...
Memorija je objekt koji izgleda ovako:
```
memorija
	001
		limiti
			buy
				limit objekt
			sell
				limit objekt

		pozicije
			0015
				poz objekt
			0018
				poz objekt
			...
				(ostale pozicije itd.)

		traileri
			0001
				trailer objekt
			0003 
				trailer objekt
			...
				(ostali traileri itd.)
		
		(ostali propertyji portfolija)
		
	002
		... (cijeli drugi portfolio itd.) ...
```


### Objekti za stvaranje limita, pozicija i trailera
DOPUNITI/DORADITI OVAJ API S PRECIZNO DEFINIRANIM PROPERTYJIMA
```javascript
// PODACI ZA TRAILERE
trailerData = {
	id: (id pozicije),
	cijena: 740.40, 
	odmak: -5.30  
}

// PODACI ZA POZICIJE
pozData = {
	portfolio
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	base: 2.345, 
	quote: 756.78,  
	stop: 780.50
}

// PODACI ZA LIMIT ORDERE
limitData = {
	portfolio
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	iznos: 2.345,
	limitCijena: 756.78
}
```


