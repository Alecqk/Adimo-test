const axios = require('axios')
const { JSDOM } = require("jsdom")
const fs = require("fs");

axios.get('https://cdn.adimo.co/clients/Adimo/test/index.html')
    .then(response => {
        // HTML is inside response.data
        const dom = new JSDOM(response.data);
        let cheeseObj = {
            items: [],
            numItems: null,
            avgPrice: null
        }

        const cheeseAll = dom.window.document.querySelectorAll('.item');
        cheeseAll.forEach((item) => {
            cheeseObj.items.push({
                title : item.querySelector('h1').textContent,
                imgUrl : "https://cdn.adimo.co/clients/Adimo/test/" + item.querySelector('img').src,
                price : parseFloat(item.querySelector('span.price').textContent.replace(/[^0-9\.-]+/g,""))
            })
        })

        cheeseObj.numItems = cheeseObj.items.length
        cheeseObj.avgPrice = ((cheeseObj.items.reduce((acc , cur) => acc + cur.price, 0)) / cheeseObj.numItems).toFixed(2);
        //console.log(cheeseObj)
        fs.writeFile('cheesefile.json', JSON.stringify(cheeseObj), (error) => {
            if (error) console.log(error);
          });
    })
    .catch(error => {
        //Print error if any occured
        console.log(error)
    })

    