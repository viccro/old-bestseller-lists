import {getLibraries} from './cookies-script.js';
import {db_config, lookup_availability} from './db.js';
import * as moment from 'moment';

var $ = require('jquery');
require("dotenv").config();

db_config();

var today = moment();
var librariesList = getLibraries();
var list_date = today;

async function run_queries(){

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
    
    let div_row = $("#results"),
        div_col = document.createElement('div'),
        link = document.createElement('a'),
        p_author = document.createElement('p'),
        p_title = document.createElement('p'),
        img = document.createElement('img');

    img.addClass("rounded img-fluid");
    img.attr("src",book.cover);

    p_author.text(book.author);
    p_author.addClass("serif author");

    p_title.text(book.title);
    p_title.addClass("serif title");

    link.attr("href", overdrive_url);
    link.appendChild(img);
    link.appendChild(p_title);
    link.appendChild(p_author);
    
    div_col.addClass("col-sm-3  text-center");
    div_col.appendChild(link);

    div_row.appendChild(div_col);
}

function generate_url(date,book_list){
    return 'https://api.nytimes.com/svc/books/v3/lists/' + date + '/' + book_list + '.json?api-key='+process.env.NYT_API_KEY; 
}

function stringify_date(date){
    return date.getFullYear() + '-' + ("0" + date.getMonth()).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
}

function enough_items_found(){
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

const url = process.env.OVERDRIVE_SEARCH_URL_ROOT;
const scheme = process.env.OVERDRIVE_SCHEME;
const proxyUrl = "https://immense-waters-04792.herokuapp.com/";

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
            if (book_object.author === book.firstCreatorName ) {
              let book_url = "http://" + libraryShortName + ".overdrive.com/media/" + book.id;

              db_add(moment().format("YYYY-MM-DD HH:mm:ss"), searchUrl, book_object, libraryShortName, book.isAvailable)
              console.log("HERE")
              if (!book.isAvailable) { //TODO - Put this back
                display_available_book(book_object, libraryShortName, book_url)
              }
            }
          }
        }
        else {
          if (data.type == "cors"){
            console.log("Cors gotcha again! MUAHAHAHAHA")
          }
        }
      })
      .catch(function(error) {
        console.log('womp womp')
        console.log(error);
      });
    }
}

export function generate_overdrive_url(title, libraryShortName){
  return proxyUrl + scheme + libraryShortName + url + encodeURIComponent(title);
}
