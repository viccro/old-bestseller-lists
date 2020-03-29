import {db_config, db_add, lookup_availability} from './db.js';
import * as moment from 'moment';

var $ = require('jquery');
require("dotenv").config();

db_config();

var today = moment();
var list_date = today;
var librariesList = ["bpl"] //getLibraries();


const url = process.env.OVERDRIVE_SEARCH_URL_ROOT;
const scheme = process.env.OVERDRIVE_SCHEME;
const proxyUrl = "https://immense-waters-04792.herokuapp.com/";

window.run_queries = async function (){
    for (let count = 0; count < 1; count ++){
    let date_string = list_date.format('YYYY-MM-DD'); 
    await getBestsellers(generate_url( date_string ,'hardcover-fiction' ));
    
    if (enough_items_found()){  
        break;
    }
    list_date = list_date.subtract(7, 'days'); 
    }
}

//Hit the NYT Book Lists API to get a list of possible Bestseller Lists to access
async function getBestsellers(url){
    let bestsellers = fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
        let bookList = new Array();
        let booksRaw = data.results.books;

        //process each of the books individually
        booksRaw.map(function(booksRaw) {
            //create book object 
            var book = {title:booksRaw.title, author:booksRaw.author, isbn:booksRaw.primary_isbn10, cover:booksRaw.book_image }

            //check if book is in cache
            lookup_availability(book, librariesList)
        })
    })
    .catch(function(error) {
        console.log(error);
        });  
    return bestsellers;
}

export function display_available_book(book, library, overdrive_url){
  let div_row = $("#results")[0],
    div_col = document.createElement('div'),
    link = document.createElement('a'),
    img = document.createElement('img'),
    div_row_sub = document.createElement('div'),
    div_col_text = document.createElement('div'),
    p_author = document.createElement('p'),
    p_title = document.createElement('p'),
    div_col_icon = document.createElement('div'),
    format_icon = document.createElement('img');
  

    if (book.is_audio){
      format_icon.setAttribute("src", "images/headphones.png");
    } else {
      format_icon.setAttribute("src", "images/ebook.png");
    }
    format_icon.setAttribute("class", "rounded img-fluid");

    div_col_icon.setAttribute("class", "col mt-2");
    div_col_icon.appendChild(format_icon);

    p_author.innerHTML = book.author;
    p_author.setAttribute("class", "serif author text-left");

    p_title.innerHTML = book.title;
    p_title.setAttribute("class","serif title font-weight-bold text-left mt-1 mb-0");

    div_col_text.setAttribute("class", "col-sm-8 text-center");
    div_col_text.appendChild(p_title);
    div_col_text.appendChild(p_author);

    div_row_sub.setAttribute("class", "row");
    div_row_sub.appendChild(div_col_text);
    div_row_sub.appendChild(div_col_icon);

    img.setAttribute("src", book.cover);
    img.setAttribute("class", "rounded img-fluid")

    link.setAttribute("href", overdrive_url);
    link.appendChild(img);
    link.appendChild(div_row_sub);
    
    div_col.setAttribute("class", "col-sm-3  text-center");
    div_col.appendChild(link);

    div_row.appendChild(div_col);
}

function generate_url(date,book_list){
    return 'https://api.nytimes.com/svc/books/v3/lists/' + date + '/' + book_list + '.json?api-key='+process.env.NYT_API_KEY; 
}

window.generate_url = generate_url;

function stringify_date(date){
    return date.getFullYear() + '-' + ("0" + date.getMonth()).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
}

export function enough_items_found(){
    let count = $("#bestsellers").find("li").length ;
    if (count > 10) {
        pare_down_books_shown(count - 10);
        return true;
    }
    return false;
}

function pare_down_books_shown(excess_count){
    console.log(excess_count);
    //TODO
}

/**
 * QSearch Overdrive for a given set of library urls (taken from cookies) and return whether a book is available or not
 * @param {string} title
 * @param {string[]} libraryUrls  
 * @return {books[]} books that are available
 */
export function search_overdrive(book_object, libraryUrls) {
  for (var lib in libraryUrls) {
    var libraryShortName = libraryUrls[lib];
    var searchUrl =  generate_overdrive_url(book_object.title, libraryShortName);

    fetch(searchUrl, { "Content-Type": "text/plain"   })
      .then(response => response.text())
      .then(function(data) {
        var match = /\.mediaItems ?=(.*?});/.exec(data);
        if (match) {
          var bookList = JSON.parse(match[1].trim());
          for (var key in bookList) {
            let book = bookList[key];

            book_object.is_audio = false;
            for (var fmt_num in book.formats){
              let format = book.formats[fmt_num].id
              if (format.includes("audiobook")) {
                book_object.is_audio = true;
              }
            }
            if (book_object.author === book.firstCreatorName ) {
              let book_url = "http://" + libraryShortName + ".overdrive.com/media/" + book.id;
              book_object.book_url = book_url;

              db_add(moment().format("YYYY-MM-DD HH:mm:ss"), searchUrl, book_object, libraryShortName, book.isAvailable)

              if (!book.isAvailable) { //TODO - Put this back
                display_available_book(book_object, libraryShortName, book_url)
              }
            }
          }
        }
      })
      .catch(function(error) {
        console.log(error);
      });
    }
}

export function generate_overdrive_url(title, libraryShortName){
  return proxyUrl + scheme + libraryShortName + url + encodeURIComponent(title);
}

//window.run_queries();