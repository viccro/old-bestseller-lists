import {getLibraries, displayCookieValues} from './cookies-script';
import * as moment from 'moment';

var $ = require('jquery');
require("dotenv").config();
db_config();

var today = moment();
var list_date = today;
var librariesList = getLibraries();
var dbName = "undefined";

const url = process.env.OVERDRIVE_SEARCH_URL_ROOT;
const scheme = process.env.OVERDRIVE_SCHEME;
const proxyUrl = "https://immense-waters-04792.herokuapp.com/";

displayCookieValues(getLibraries());
 
window.run_queries = async function (){
    while(!enough_items_found()){
    let date_string = list_date.format('YYYY-MM-DD'); 
    await getBestsellers(generate_url( date_string ,'hardcover-fiction' ));
    
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

export function display_available_book(book, library, overdrive_url, is_audio){
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
  

    if (is_audio){
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
    
    div_col.setAttribute("class", "col-sm-3  text-center book-item");
    div_col.appendChild(link);

    div_row.appendChild(div_col);
}

function generate_url(date,book_list){
    return process.env.NYT_API_URL + date + '/' + book_list + '.json?api-key='+process.env.NYT_API_KEY; 
}

window.generate_url = generate_url;

function stringify_date(date){
    return date.getFullYear() + '-' + ("0" + date.getMonth()).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
}

export function enough_items_found(){
    let count = $("#results").find(".book-item").length;
    console.log(count + " items found so far")
    return (count > 12);
}

/**
 * QSearch Overdrive for a given set of library urls (taken from cookies) and return whether a book is available or not
 * @param {string} title
 * @param {string[]} libraryUrls  
 * @return {books[]} books that are available
 */
export function search_overdrive(book_object, libraryUrls) {
  for (var lib in libraryUrls) {
    let libraryShortName = libraryUrls[lib];
    let searchUrl =  generate_overdrive_url(book_object.title, libraryShortName);

    fetch(searchUrl, { "Content-Type": "text/plain"   })
      .then(function(response){
        if (!response.ok && response.status == 404) {
          warn_about_invalid_library_url(searchUrl)
        }
        return response;
      })
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

              if (book.isAvailable) { 
                display_available_book(book_object, libraryShortName, book_url, book_object.is_audio)
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

/**
 * Return a version of IndexedDB based on browser in use. 
 * @return {indexedDB} the appropriate IndexedDB 
 */
function db_config() {
  if (!window.indexedDB) {
     window.alert("Your browser doesn't support a stable version of IndexedDB.")
  }

  let request = indexedDB.open(dbName, 1);

  request.onerror = function(event) {
    console.log("There's an issue with your indexed DB!")
  };
  request.onupgradeneeded = function(event) {
    var db = event.target.result;

    // Create an objectStore to hold information about previous calls to overdrive
    if (!db.objectStoreNames.contains("requests")) {
      var objectStore = db.createObjectStore("requests", { keyPath: "url" });
    }
  };
  request.onsuccess = function(event) {
  }
}

export function db_add(TIMESTAMP, URL, book, LIBRARY, AVAILABLE) {
  var request = indexedDB.open(dbName);

  request.onerror = function(event) {
    console.log("There's an issue with your indexed DB!")
  };
  request.onsuccess = function(event) {
    var db = event.target.result;

    var request = db.transaction(["requests"], "readwrite")
    .objectStore("requests")
    .put({ timestamp: TIMESTAMP, availability: AVAILABLE, library: LIBRARY, title: book.title, url: URL, image: book.cover, book_url: book.book_url, is_audio: book.is_audio });
    
    request.onsuccess = function(event) {
      //Stub
    };
    
    request.onerror = function(event) {
      alert("Unable to add data: " + URL);
    }
  }
}

export function lookup_availability(book, librariesList) {
  let request = indexedDB.open(dbName);
  request.onsuccess = function(event) {
    var db = event.target.result;
    for (var lib in librariesList) {
      var libraryShortName = librariesList[lib];

      let request = db.transaction(["requests"])
      .objectStore("requests")
      .get( generate_overdrive_url(book.title, libraryShortName) );

      request.onsuccess = function(event) {
        let entry = request.result
        //If the lookup url isn't found, entry will be undefined
        //If the timestamp is too early, we gotta bust that cache
        if (entry && is_valid_timestamp(entry.timestamp)) {
            //Use the cached data
            if (entry.availability){
              display_available_book(book, libraryShortName, entry.book_url, entry.is_audio)
            }
        }
        else {
          search_overdrive(book, librariesList)
        }
      };
      request.onerror = function(event) {
        alert("Unable to lookup data");
      }
    }
  }
  request.onerror = function(event) {
    console.log("There's an issue with your indexed DB!")
  };
}

function is_valid_timestamp(timestamp){
  let today = moment();
  let yesterday = today.subtract(1, 'days')
  let formatted_time = moment(timestamp, "YYYY-MM-DD HH:mm:ss")
  return (moment(formatted_time).isAfter(yesterday))
}

/**
 * When provided with a libraryShortName, this function adds a warning if necessary that the short name appears to be invalid. 
 * This function dedupes requests, so that each library should only be named once. 
 * @param {string} searchUrl the URL that 404'd
 */
function warn_about_invalid_library_url(searchUrl){
  let overdrive_url = searchUrl.split("http://").pop()
  let libraryShortName = overdrive_url.split(".")[0]

  let warnings_ul = $("#warnings")[0],
    li = document.createElement('li');

  let existingLis = warnings_ul.getElementsByTagName("li");
  for (var lisNum in existingLis){
    let text_value = existingLis[lisNum].innerHTML
    if (text_value != undefined) {
      let listedShortName = text_value.split(" ")[0]
      if (libraryShortName === listedShortName){
        return
      }
    }
  }
  li.innerHTML = `${libraryShortName} does not appear to be a valid library short name.`;

  warnings_ul.appendChild(li);
}