import {display_available_book, generate_overdrive_url, search_overdrive} from './bestseller-api.js';
import * as moment from 'moment';

var $ = require('jquery');

var dbName = "requestStore"

/**
 * Return a version of IndexedDB based on browser in use. 
 * @return {indexedDB} the appropriate IndexedDB 
 */
export function db_config() {
  // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || 
  // window.msIndexedDB;
   
  // window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || 
  // window.msIDBTransaction;
  // window.IDBKeyRange = window.IDBKeyRange || 
  // window.webkitIDBKeyRange || window.msIDBKeyRange
   
  if (!window.indexedDB) {
     window.alert("Your browser doesn't support a stable version of IndexedDB.")
  }

  var request = indexedDB.open(dbName, 1);

  request.onerror = function(event) {
    console.log("There's an issue with your indexed DB!")
  };
  request.onupgradeneeded = function(event) {
    var db = event.target.result;

    // Create an objectStore to hold information about previous calls to overdrive
    var objectStore = db.createObjectStore("requests", { keyPath: "url" });

    // Create an index to search requests by availability, in case we want to query 
    // for all the available books
    objectStore.createIndex("availablility", "available", { unique: false });
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
    .put({ timestamp: TIMESTAMP, availability: AVAILABLE, library: LIBRARY, title: book.title, url: URL, image: book.cover });
    
    request.onsuccess = function(event) {
      //Stub
    };
    
    request.onerror = function(event) {
      alert("Unable to add data: " + URL);
    }
  }
}

export function lookup_availability(book, librariesList) {
  var request = indexedDB.open(dbName);

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
            if (!entry.availability){
              display_available_book(book, libraryShortName, entry.url)
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

//add("yesterday", "wub.com", "Go Dog Go", "bpl", true)

db_config()
//async_add("tomorrow", "www.wub.com", "Go Dog Go", "bpl", true)
lookup_availability("wub.com.blob")

// Use transaction oncomplete to make sure the objectStore creation is 
    // finished before adding data into it.
    // indexedDB.objectStore.transaction.oncomplete = function(event) {
    //   // Store values in the newly created objectStore.
    //   var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
    //   requestData.forEach(function(customer) {
    //     customerObjectStore.add(customer);
    //   });
    // };
