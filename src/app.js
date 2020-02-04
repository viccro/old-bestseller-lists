import 'bootstrap';
import './scss/app.scss';
import * as $ from 'jquery';

require("dotenv").config();
console.log(process.env.NYT_API_KEY)

function createNode(element) {
    return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}

const ul = document.getElementById('authors');
const url = 'https://api.nytimes.com/svc/books/v3/lists/names.json?api-key='+process.env.NYT_API_KEY;
fetch(url)
.then((resp) => resp.json())
.then(function(data) {
  let bookLists = data.results;
  return bookLists.map(function(bookList) {
    let li = createNode('li'),
        span = createNode('span'),
        ul = $("#bookLists")[0];
    span.innerHTML = `${bookList.list_name} ${bookList.updated}`;
    append(li, span);
    append(ul, li);
  })
})
.catch(function(error) {
  console.log(error);
});    