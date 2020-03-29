var $ = require('jquery');
import * as moment from 'moment';
import {enough_items_found, getBestsellers} from './bestseller-api.js';


var today = moment();
var list_date = today;

window.set_p_tag = async function (){
  for (let count = 0; count < 1; count ++){
    let date_string = list_date.format('YYYY-MM-DD'); 
    await getBestsellers(generate_url( date_string ,'hardcover-fiction' ));
    
    if (enough_items_found()){  
        break;
    }
    list_date = list_date.subtract(7, 'days'); 
    }

  let div_row = $("#results")[0],
      p_tag = document.createElement('p');

  p_tag.innerHTML = "Hooray";
  div_row.appendChild(p_tag);
}

