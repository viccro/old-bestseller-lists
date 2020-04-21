import $ from 'jquery';

var today_date = (new Date()).getTime();
var day = 1000 * 60 * 60 * 24 // ms/sec * sec/min * min/hr * hr/day = one day in milliseconds

var cookie_name = "libraryList"

/**
 * Set a cookie with a 30 day expiration date for the specified value
 * @param {string} value 
 */
function setCookie(value)
{
    var expiration_date = new Date(today_date + (30 * day)); // today + 30 days
    document.cookie = cookie_name + "=" + escape(value) + "; path=/; expires=" + expiration_date.toGMTString();
}

/**
 * Displays a list of libraries to the #libraries item on the page.
 * @param {[string]} list_of_libraries 
 */
export function displayListOfLibraries(list_of_libraries){

    for (var library in list_of_libraries){
        var lib = list_of_libraries[library]

        let li = document.createElement('li'),
            span = document.createElement('span'),
            x_input = document.createElement('input'),
            ul = $("#libraries")[0];
            
            x_input.setAttribute("type", "image");
            x_input.setAttribute("src", "images/red_x.png");
            x_input.setAttribute("height", "10em")

            span.innerHTML = `${lib}`;
            span.setAttribute("class", "short-lib-display-name")

            li.appendChild(span);
            li.appendChild(x_input);
            ul.appendChild(li);

            x_input.onclick = function(){
                let libraryShortName = event.currentTarget.previousSibling.innerHTML;
                removeLibrary(libraryShortName);
                location.reload();
            }
    }
}

/**
 * Get the value of a cookie
 * @returns {string} cookie_value is the value stored in the cookie
 */
function getCookie()
{
    // Original JavaScript code by Chirp Internet: www.chirp.com.au
    var re = new RegExp(cookie_name + "=([^;]+)");
    var value = re.exec(document.cookie);
    var cookie_value = (value != null) ? unescape(value[1]) : null;
    return cookie_value;
}

/**
 * Parse the json value of the cookie to get the list of libraries
 * @return {[string]} list of libraries
 */
export function getLibraries()
{
    return JSON.parse(getCookie());
}

/**
 * Delete a cookie by setting its expiration date to yesterday
 */
function deleteCookie()
{
    var expiration_date = new Date(today - day); // less 24 hours

    document.cookie = cookie_name + "=null; path=/; expires=" + expiration_date.toGMTString();
}

/**
 * Read the value of the cookie, add the new library short name to the list, and reinsert the cookie with updated value
 * @param {string} libraryUrl a short name for the library
 */
function addLibrary(libraryUrl){
    var current_libraries = getCookie();
    if (current_libraries === null){
        current_libraries = "[]"
    }
    var list_of_libraries = JSON.parse(current_libraries);
    list_of_libraries.push(libraryUrl);
    setCookie(JSON.stringify(list_of_libraries));
    return true;
}

/**
 * Read the value of the cookie, remove the specified library short name from the list, and reinsert the cookie with updated value
 * @param {string} libraryUrl a short name for the library
 */
function removeLibrary(libraryUrl){
    var list_of_libraries = JSON.parse(getCookie());
    console.log(list_of_libraries)
    list_of_libraries.splice( list_of_libraries.indexOf(libraryUrl) , 1);
    setCookie(JSON.stringify(list_of_libraries));
    return true;
}

/**
 * This is the function that is run when the button "Add Library Short Name" is clicked. It adds a library value to the cookie.
 */
window.addLibraryFromSubmit = function (){
    var form = $("#manageLibraries");
    var name = $("#libraryName");
    var form_entries = $("#libraryName");
    try {
        addLibrary(form_entries[0]['value']);
    } catch (err) {
        console.log(err);
    }
    location.reload();
}


