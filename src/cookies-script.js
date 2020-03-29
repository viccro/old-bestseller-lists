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
            x_img = document.createElement('img'),
            x_input = document.createElement('input'),
            ul = $("#libraries")[0];
            
            x_input.setAttribute("type", "image");
            x_input.setAttribute("src", "images/600px-Dark_Red_x.svg.png");
            x_input.setAttribute("height", "10em")

            // x_img.setAttribute("src", "images/600px-Dark_Red_x.svg.png")
            // x_img.setAttribute("height", "10em")
            
            // x_button.setAttribute("class", "no-padding-btn")
            // x_button.appendChild(x_img);

            span.innerHTML = `${lib} `;
            li.appendChild(span);
            li.appendChild(x_input);
            ul.appendChild(li);

            x_input.onclick = function(){
                removeLibrary(lib);
                location.reload();
            }
    }
    
}

function getCookie()
{
    // Original JavaScript code by Chirp Internet: www.chirp.com.au
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
    if (current_libraries === null){
        current_libraries = "[]"
    }
    var list_of_libraries = JSON.parse(current_libraries);
    list_of_libraries.push(libraryUrl);
    setCookie(JSON.stringify(list_of_libraries));
    return true;
}

function removeLibrary(libraryUrl){
    var list_of_libraries = JSON.parse(getCookie());
    list_of_libraries.splice( list_of_libraries.indexOf(libraryUrl), 1);
    setCookie(JSON.stringify(list_of_libraries));
    return true;
}

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

// $("#manageLibraries").submit(function(){
//     alert("woah")

//    var form_entries = $(this).serializeArray();
//     try {
//         addLibrary(form_entries[0]['value']);
//     } catch (err) {
//         console.log(err);
//     }
// })

$(document).ready(function() {
    displayCookieValues(getLibraries());
})
