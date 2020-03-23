dbName = "requestStore"

/**
 * Return a version of IndexedDB based on browser in use. 
 * @return {indexedDB} the appropriate IndexedDB 
 */

  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || 
  window.msIndexedDB;
   
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || 
  window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || 
  window.webkitIDBKeyRange || window.msIDBKeyRange
   
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
    db = event.target.result;
  }


function add(TIMESTAMP, URL, TITLE, LIBRARY, AVAILABLE) {
  var request = indexedDB.open(dbName);

  request.onerror = function(event) {
    console.log("There's an issue with your indexed DB!")
  };
  request.onsuccess = function(event) {
    var db = event.target.result;

    var request = db.transaction(["requests"], "readwrite")
    .objectStore("requests")
    .put({ timestamp: TIMESTAMP, availability: AVAILABLE, library: LIBRARY, title: TITLE, url: URL });
    
    request.onsuccess = function(event) {
      //Stub
    };
    
    request.onerror = function(event) {
      alert("Unable to add data: " + URL);
    }
  }
}

add("yesterday", "wub.com", "Go Dog Go", "bpl", true)
// Use transaction oncomplete to make sure the objectStore creation is 
    // finished before adding data into it.
    // indexedDB.objectStore.transaction.oncomplete = function(event) {
    //   // Store values in the newly created objectStore.
    //   var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
    //   requestData.forEach(function(customer) {
    //     customerObjectStore.add(customer);
    //   });
    // };
