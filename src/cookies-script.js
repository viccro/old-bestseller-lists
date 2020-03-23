import $ from 'jquery';

var today_date = (new Date()).getTime();
var day = 1000 * 60 * 60 * 24 // ms/sec * sec/min * min/hr * hr/day = one day in milliseconds

var cookie_name = "libraryList"

//Takes in two string values
function setCookie(value)
{
    var expiration_date = new Date(today_date + (30 * day)); // today + 30 days
    document.cookie = cookie_name + "=" + escape(value) + "; path=/; expires=" + expiration_date.toGMTString();
}

function displayCookieValues(list_of_libraries){
    for (var library in list_of_libraries){
        var lib = list_of_libraries[library]

        let li = document.createElement('li'),
            span = document.createElement('span'),
            x_button = document.createElement('button'),
            ul = $("#libraries")[0];
            
            span.innerHTML = `${lib}`;
            li.appendChild(span);
            li.appendChild(x_button);
            ul.appendChild(li);

            x_button.onclick = function(){
                removeLibrary(lib);
            }
    }
}

function getCookie()
{
    // Original JavaScript code by Chirp Internet: www.chirp.com.au
    // Please acknowledge use of this code by including this header.
    var re = new RegExp(cookie_name + "=([^;]+)");
    var value = re.exec(document.cookie);
    var cookie_value = (value != null) ? unescape(value[1]) : null;

    return cookie_value;
}

export function getLibraries()
{
    return JSON.parse(getCookie());
}

function deleteCookie()
{
    var expiration_date = new Date(today - day); // less 24 hours

    document.cookie = cookie_name + "=null; path=/; expires=" + expiration_date.toGMTString();
}

function addLibrary(libraryUrl){
    var current_libraries = getCookie();
    
    var list_of_libraries = JSON.parse(current_libraries);
    list_of_libraries.push(libraryUrl);
    setCookie(JSON.stringify(list_of_libraries));
    return true;
}

function removeLibrary(libraryUrl){
    var list_of_libraries = JSON.parse(getCookie());
    console.log(list_of_libraries);
    list_of_libraries.pop(libraryUrl);
    setCookie(JSON.stringify(list_of_libraries));
    return true;
}

//$("#manageLibraries").submit(function(){
//    var form_entries = $(this).serializeArray();
//     try {
//         addLibrary(form_entries[0]['value']);
//     } catch (err) {
//         console.log(err);
//     }
// })

// displayCookieValues(getLibraries());