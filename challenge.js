const axios = require('axios')
const { JSDOM } = require("jsdom")
const fs = require("fs");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

// bug - if item is out of stock it breaks, as tesco does not display price of out of stock items
readline.question('Enter search term: ', term => {
    makeRequest(term);
    readline.close();
})

function makeRequest(searchTerm) {
    axios.get(`https://www.tesco.com/groceries/en-GB/search?query=${searchTerm}`, {
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'cache-control': 'max-age=0',
            dnt: '1',
            priority: 'u=0, i',
            referer: 'https://cdn.adimo.co/',
            'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
        }
    })
        .then(response => {
            // HTML is inside response.data
            const dom = new JSDOM(response.data);
            let tescoObj = {
                items: [],
                numItems: null,
                avgPrice: null
            }
    
            const allItems = dom.window.document.querySelectorAll('.LD7hL');
            allItems.forEach((item) => {
                tescoObj.items.push({
                    title : item.querySelector('h3.iDJPjF').textContent,
                    imgUrl : item.querySelector('img.fMufzB').src,
                    price : parseFloat(item.querySelector('p.cXlRF').textContent.replace(/[^0-9\.-]+/g,""))
                })
            })
    
            tescoObj.numItems = tescoObj.items.length
            tescoObj.avgPrice = ((tescoObj.items.reduce((acc , cur) => acc + cur.price, 0)) / tescoObj.numItems).toFixed(2);
            //console.log(cheeseObj)
            fs.writeFile('tescofile.json', JSON.stringify(tescoObj), (error) => {
                if (error) console.log(error);
            });
        })
        .catch(error => {
            //Print error if any occured
            console.log(error);
        })
    
}
