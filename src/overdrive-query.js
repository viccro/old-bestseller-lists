import 'bootstrap';
import './scss/app.scss';
import * as $ from 'jquery';

require("dotenv").config();

const url = process.env.OVERDRIVE_SEARCH_URL_ROOT;
const scheme = process.env.OVERDRIVE_SCHEME;
const library_id = 'bpl';
const query = 'magical negro'
//const proxyUrl = "http://localhost:8080/";
const proxyUrl = "https://immense-waters-04792.herokuapp.com/";

  /**
   * Queries OverDrive for availability of an asset
   * @param {string} title
   * @param {string[]} libraryUrls  
   * @return {books[]} books that are available
   */
//Search Overdrive for a given set of library urls (taken from cookies) and return whether a book is available or not
function searchOverdrive(title, libraryUrls) {
  for (var lib in libraryUrls) {
    var libraryShortName = libraryUrls[lib];
    var searchUrl =  proxyUrl + scheme + libraryShortName + url + encodeURIComponent(title);

    fetch(searchUrl, { "Content-Type": "text/plain"   })
      .then(response => response.text())
      .then(function(data) {
        var match = /\.mediaItems ?=(.*?});/.exec(data);
        var books = [];
        if (match) {
          var bookList = JSON.parse(match[1].trim());
          for (var key in bookList) {
            var book = bookList[key];
            if (book.isAvailable) {
              books.push({
                title: book.title,
                author: book.firstCreatorName,
                isAudio: book.type.id == "audiobook",
                alwaysAvailable: book.availabilityType == "always",
                isAvailable: book.isAvailable,
                url: "http://" + lib + ".overdrive.com/media/" + book.id
              });
            }
            console.log(book.title);
          }
          return books;
        }
        else {
          if (data.type == "cors"){
            console.log("Cors gotcha again! MUAHAHAHAHA")
            console.log(searchUrl);
            console.log(data)
          }
        }
      })
      .catch(function(error) {
        console.log('womp womp')
        console.log(error);
      });
    }
}


var books = searchOverdrive('Cinderella', ['bpl', 'minuteman']);

