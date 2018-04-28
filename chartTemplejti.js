"use strict";

// pred-definirane boje za chartove
let crnaBoja = 'rgba(38, 12, 12, 0.95)';
let crvenaBoja = 'rgba(188, 32, 32, 0.76)';
let zelenaBoja = 'rgba(36, 126, 51, 0.95)';
let plavaBoja = 'rgba(63, 127, 191, 0.54)';
let rozaBoja = 'rgba(191, 63, 127, 0.54)';

const templ = {};

templ.buyLimitTemplate = function buyLimitTemplate(data) {
    let template = {
        type: 'line',
        label: 'Buy limit',
        data: data, // popuni
        borderColor: zelenaBoja, 
        borderWidth: 0.01,
        pointBorderWidth: 2,
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
        pointBackgroundColor: zelenaBoja,  
        backgroundColor: zelenaBoja 
    }
    return template;
}   

templ.sellLimitTemplate = function sellLimitTemplate(data) {
    let template = {
        type: 'line',
        label: 'Sell limit',
        data: data, // popuni
        borderColor: crvenaBoja,
        borderWidth: 0.01,
        pointBorderWidth: 2,
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
        pointBackgroundColor: crvenaBoja,
        backgroundColor: crvenaBoja
    }
    return template;
}

templ.stopTemplate = function stopTemplate(label, data, boja) {
    let template = {
        type: 'line',
        label: label, // popuni
        data: data, // popuni
        borderColor: boja, // popuni
        borderWidth: 0.01,
        pointBorderWidth: 1,
        pointStyle: 'rect',
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
        pointBackgroundColor: boja,  // popuni
        backgroundColor: boja // popuni
    }
    return template;
}

templ.trailerTemplate = function trailerTemplate(label, data, boja) {
    let template = {
        type: 'line',
        label: label, // popuni
        data: data, // popuni
        borderColor: boja, // popuni
        borderWidth: 0.01,
        pointBorderWidth: 1,
        pointStyle: 'cross',
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
        pointBackgroundColor: boja,  // popuni
        backgroundColor: boja // popuni
    }
    return template;
}

templ.cijenaTemplate = function cijenaTemplate(data) {
    let template = {
        type: 'line',
        label: 'Cijena',
        data: data,
        borderColor: crnaBoja,
        borderWidth: 3,
        lineTension: 0,
        pointBorderWidth: 1,
        pointRadius: 2,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis'    
    }
    return template;
}

templ.pfTemplate = function pfTemplate(label, data, boja) {
    let template = {
        type: 'bar',
        label: label,
        data: data,
        borderColor: boja,
        backgroundColor: boja,
        borderWidth: 0,
        yAxisID: 'left-y-axis',
        xAxisID: 'portf-x-axis'    
    }
    return template;
}

module.exports = templ;