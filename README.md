# bot-z

### Dijagramatski prikaz odnosa modula.





### Referenca za formate objekata:

LIMIT TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
memorija.limiti: {
  buy: {idParentPozicije: ...,
        cijenaLimit: ...}, 
  sell:{idParentPozicije: ...,
        cijenaLimit: ...}
}

STOP TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
memorija.stopovi: [
  0: {idParentPozicije: ...,
      triggerCijena: ...},
  1: {idParentPozicije: ...,
      triggerCijena: ...},
  (...)
]

TRAILING STOPOVI IMAJU SVOJU KLASU.
Njih samo treba svaki krug izvrtiti svima metodu .korekcija, da se prilagode kretanju cijene.
