import bootstrap from 'bootstrap';
import './scss/app.scss';
import {getLibraries} from './cookies-script.js';
import {searchOverdrive} from './overdrive-query.js';
import {getIndexedDB} from './db.js';
import * as moment from 'moment';

var $ = require('jquery');
require("dotenv").config();

var today = moment();
var day = 1000 * 60 * 60 * 24 // ms/sec * sec/min * min/hr * hr/day = one day in milliseconds

var checked_bestsellers = new Set()
var available_bestsellers = []

var librariesList = getLibraries();
var list_date = today;

for (let count = 0; count < 1; count ++){
    let date_string = list_date.format('YYYY-MM-DD'); 
    let available_bestsellers_raw = getBestsellers(generate_url( date_string ,'hardcover-fiction' ));
    console.log(available_bestsellers_raw)
    if (available_bestsellers_raw != undefined){  
        available_bestsellers.push();
    }
    list_date = list_date.subtract(7, 'days'); //new Date( list_date - (7 * day));
}

//Hit the NYT Book Lists API to get a list of possible Bestseller Lists to access
function getBestsellers(url){
var bestsellers = fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
        let bookList = new Array();
        let booksRaw = data.results.books;

        booksRaw.map(function(booksRaw) {
            if (!checked_bestsellers.has(booksRaw.title)) {
                let li = document.createElement('li'),
                span = document.createElement('span'),
                ul = $("#bestsellers")[0];

                span.innerHTML = `${booksRaw.title} ${booksRaw.author} ${booksRaw.primary_isbn10} ${booksRaw.book_image}`;
                li.appendChild(span);
                ul.appendChild(li);  

                var book = {title:booksRaw.title, author:booksRaw.author, isbn:booksRaw.primary_isbn10, cover:booksRaw.book_image }

                bookList.push(book);
                console.log(searchOverdrive(book.title, book.author, librariesList));
            }
            checked_bestsellers.add(booksRaw.title);
        })
        
        return bookList;
})
.catch(function(error) {
    console.log(error);
    });  
    return bestsellers;
}

function generate_url(date,book_list){
    return 'https://api.nytimes.com/svc/books/v3/lists/' + date + '/' + book_list + '.json?api-key='+process.env.NYT_API_KEY; 
}

function stringify_date(date){
    return date.getFullYear() + '-' + ("0" + date.getMonth()).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
}

//getBestsellers(url)  