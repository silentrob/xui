/**
	Data
	=====

	Key, Value Element store, with Bindings to HTML5 Data Atribuites

*/
x$.extend({
    
    /**
    	setData
    	--------

    	Sets element internal object with some arbitraty data. 
    	If you want to set the HTML5 Data Attribute Directly, use x$().attr()

    	### syntax ###
 
    		x$( selector ).setData( property, value);

    	### arguments ###

    	- property `String` is the name of the property to set.
    	- value `Mixed` is the new value of the property. Can be `String`, `Number`, `Float`, or `Object`

    	### example ###

    		x$('.flash').setData("pi", 3.145 );
    		x$('.flash').setData('color', '#000');
    */
    
  setData: function(key, value) {
      this.each(function(el) {
          el[key] = value;
      });
      return this;
  },
  
  /**
  	getData
  	--------

  	getting data from a element, checks internal list, then falls back to HTML5 data Attributes. 
  	getData has a simular API to getStyle.

  	### syntax ###

  		x$( selector ).getData( property, callback);

  	### arguments ###

  	- property `String` is the name of the key to set.
  	- callback `function` _Optional_ is a callback returning the element with data

  	### example ###

  		x$('.flash').data("pi");
  		x$('.flash').data('color');
  		x$('.flash').data('color', function(el, data) {
  		    alert(el, data)
  		});  		
  */
    
  getData: function(key, callback) {
      if (callback === undefined) {
          var keys = [];
          this.each(function(el) {
              if(el[key] === undefined) {
                  keys.push(x$(el).attr("data-" + key)[0])
              } else {
                  keys.push(el[key]);
              }
          });
          return keys;
      } else {
          return this.each(function(el) { callback(el, el[key]); });
      }      
  }
  
});