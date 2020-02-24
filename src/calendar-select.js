import 'bootstrap';
import './scss/app.scss';
import * as $ from 'jquery';

require("dotenv").config();

const url = 'https://api.nytimes.com/svc/books/v3/lists/2019-01-20/hardcover-fiction.json?api-key='+process.env.NYT_API_KEY;

//Hit the NYT Book Lists API to get a list of possible Bestseller Lists to access
fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
    let bestsellerListRaw = data.results.books;
    console.log(data)

    return bestsellerListRaw.map(function(bestsellerRaw) {
        let li = document.createElement('li'),
        span = document.createElement('span'),
        img = document.createElement('img'),
        ul = $("#bestsellerList")[0];

        try{
        span.innerHTML = `${bestsellerRaw.title} ${bestsellerRaw.author} ${bestsellerRaw.primary_isbn13}`;
        img.src=bestsellerRaw.book_image

        li.appendChild(img)
        li.appendChild(span);
        ul.appendChild(li);  
        } catch(error){
            console.log('wompa womp')

            console.log(error);
        }

    })
})
.catch(function(error) {
    console.log('womp womp')
    console.log(error);
    });  


