/*
  This file covers
  a *minimal* example of how reactive programming can make your programs shorter.
  
  Skip to the [Data Model](#data-model-first), [View Code](#view-code) or [Processing Input(controller)](#processing-input)
*/



/*
=== Data Model First ===
*/



/*
  We start by creating a couple of live values.
  We can then access these values by calling `subtotal()` or `taxRate()`.
  Note the parenthesis. We'll go over how to change the values later.
  
*/
var subtotal = propagate(0);
var taxRate = propagate(0.06);

/*
  Then, within the next few functions we just use our new accessors to calculate some things.
  
  These four functions are only acting on data and return numerical values; no view code at all.
  
  Note that these calculation functions dont have to be wrapped with `propagate();`, 
  this is because they don't have any side-effects: 
  running them over and over again wouldn't really change anything, 
  so there is no need to track them directly with `propagate();`
  
*/
var calculateTax = function(){
   return subtotal() * taxRate();
};

var calculateTotal = function(){
  return subtotal() + calculateTax();
};

function freeShipping(){
  return subtotal() > 20.0;
};

/* 
  This is the best way to do currency formatting, by the way.
  If you use a for-loop when you need to output 0.00, you're doing it wrong.
*/
function dollars(f){
  f = parseFloat(f).toFixed(2);
  return "$"+f;
};

/* 
  === View Code ===
*/



/*
  Here we set the inner html of some spans to a formatted currency.
  
  Here we *do* wrap our function declaration with `propagate();` because we want this function to be re-run *any time its dependencies change*.
  
  In this case, this function depends on `subtotal()`, `calculateTax()` and `calculateTotal()`. 
  We are tracking `subtotal()` but we aren't tracking `calculateTax()` directly.  
  
  How will we know to re-run this function if the rax rate changes? 
  
  Well, `calculateTax()` calls `subTotal()` and `taxRate()`, both of which we *are* tracking. 
  `propagate()` can track dependencies through arbitrarily-deep call stacks.
  When either `subTotal()` or `taxRate()` change, 
  any tracked function that called `calculateTax()` will get re-run.

*/
var updateNumbers = propagate(function(){
  $('#subtotal').html(dollars(subtotal()));
  $('#tax').html(dollars(calculateTax()));
  $('#total').html(dollars(calculateTotal()));
});


/*
  This function toggles the visibility of the _free shipping_ notifications.
*/
var updateFreeShipping = propagate(function(){
  if(freeShipping()){
    $('#freeShipping').show();
    $('#freeShippingAd').hide();
  }else{
    $('#dollarsToGo').html(dollars(20.00 - subtotal()));
    $('#freeShipping').hide();
  }
});

//Just one initial call to get things wired up.
//  we never have to call these again!
//  if our data changes, that change will propagate up 
updateNumbers();
updateFreeShipping();
//  ----

/* 
=== Processing Input ===
  (Controller)
*/


/*
  This is just about the coolest thing.  Here we add the handling for changing the tax rate.
  
  
  In these few lines of code, we set up an event handler that pushes the value into our data model.
  ...
  And that's it!  No funky callback registration or having to worry about what part of the UI we have to update, we just take events and push their impact into our data model.  That is what a controller should be!
*/
function taxSelectorChange(){
  taxRate(parseFloat($('#tax-selector').val()));
}

$('#tax-selector').live('change', taxSelectorChange);
taxSelectorChange();//some browsers might cache the form selection

/*
  This will validate the input and add the purchase price to our subtotal,
  everything else will get run automagically.
  

*/

function add(){
  var quantity = parseFloat($('#quantity').val());
  
  if(! isNaN(quantity)){ //input validation, for Spencer
    alert('enter a number, please');
  }else{
    subtotal(subtotal() + quantity);    
  }

  $('#quantity').val('');
};

/*
(c) Aaron Blohowiak 2010


Prepared using my fork of Pycco, which is itself a port of Docco.
*/




// yay, formatting