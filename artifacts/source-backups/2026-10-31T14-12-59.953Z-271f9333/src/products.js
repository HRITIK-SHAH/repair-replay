export const products = [
 {id:'orbit',name:'Orbit headphones',category:'Audio',price:499900,color:'#aac0d5',kind:'headphones',description:'Over-ear comfort, tactile controls, and a fold-flat design for your daily soundtrack.'},
 {id:'pebble',name:'Pebble speaker',category:'Audio',price:249900,color:'#d8a67e',kind:'speaker',description:'A compact wireless speaker with a woven finish and a simple volume dial.'},
 {id:'arc',name:'Arc desk lamp',category:'Workspace',price:329900,color:'#bcc8a9',kind:'lamp',description:'A focused pool of warm light with an adjustable arm and a weighted base.'},
 {id:'form',name:'Form keyboard',category:'Workspace',price:399900,color:'#d6cabc',kind:'keyboard',description:'A compact wireless keyboard with softly sculpted keys for a considered workspace.'},
 {id:'folio',name:'Folio laptop sleeve',category:'Travel',price:149900,color:'#b5b7cf',kind:'sleeve',description:'A padded 14-inch sleeve with a soft lining and a secure zip closure.'},
 {id:'loop',name:'Loop charging cable',category:'Charging',price:69900,color:'#d5ae91',kind:'cable',description:'A braided one-metre USB-C cable with a reusable cable tie.'},
 {id:'dock',name:'Dock wireless charger',category:'Charging',price:199900,color:'#a9c5bc',kind:'charger',description:'A low-profile charging pad for compatible wireless-charging devices.'},
 {id:'roam',name:'Roam tech pouch',category:'Travel',price:129900,color:'#d2bd8c',kind:'pouch',description:'Keep cables and small accessories together with flexible internal pockets.'}
];
export const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2,minimumFractionDigits:2}).format(value/100);
