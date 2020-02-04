import 'bootstrap';
import './scss/app.scss';
import * as $ from 'jquery';

require("dotenv").config();

const url = 'https://api.nytimes.com/svc/books/v3/lists/names.json?api-key='+process.env.NYT_API_KEY;
var bookLists = new Array();

//Hit the NYT Book Lists API to get a list of possible Bestseller Lists to access
fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
    let bookListsRaw = data.results;

    return bookListsRaw.map(function(bookListRaw) {
        let li = document.createElement('li'),
        span = document.createElement('span'),
        ul = $("#bookLists")[0];

        span.innerHTML = `${bookListRaw.list_name} ${bookListRaw.updated} ${bookListRaw.oldest_published_date} ${bookListRaw.newest_published_date}`;
        li.appendChild(span);
        ul.appendChild(li);  

        var bookList = {name:bookListRaw.list_name, oldest_published_date:bookListRaw.oldest_published_date, newest_published_date:bookListRaw.newest_published_date }

        bookLists.push(bookList);
        console.log(bookLists)

    })
})
.catch(function(error) {
    console.log(error);
    });  

console.log(bookLists);


  