/*
This file covers the colors demo. Most of it is pretty straightforward.

The most interesting thing is [adding the analogs](#adding-automatically-updating-analogs)
which requires very little code, even though it is automatically wired up with all of the dynamic events, because it is wired to the data model.
*/



/*
 run when the document is ready
*/
$(function() {
	
/*
   main data structure that all of the ui is based on
  we have three concrete values, and three derrived values
 */
 
	var color = {
		r: propagate(160),
		g: propagate(90),
		b: propagate(45),
		h: propagate(function() {
			return hsvByte(0);
		}),
		s: propagate(function() {
			return hsvByte(1);
		}),
		v: propagate(function() {
			return hsvByte(2);
		})
	};
	
/*
  activate HSV propagation!
 */
 
	$('hsv'.split('')).each(function(i, c) {
		color[c]();
	});
	
/*
  convienence for returning a 0-255 normalized version of HSV (0.0 - 1.0)
 */
 
	function hsvByte(index) {
		return Math.floor($.Color(colorString()).toHSV()[index] * 255);
	}
	
/*
  takes a byte and makes sure it is between 0 - 255 (no overages or <0)
 */
 
	function byteConstrain(input) {
		return Math.max(Math.min(input, 255), 0);
	}
	
/*
  return a 00-FF hex representation of a byte
 */
 
	function toOctet(n) {
		var str = (n % 256).toString(16);
		if (str.length < 2) {
			str = "0" + str;
		}
		return str;
	}
	
/*
  return the RGB hex code of a color.
 */
 
	function colorString() {
		return "#" + toOctet(color.r()) + toOctet(color.g()) + toOctet(color.b());
	}
	
/*
   function that will keep the main color panel up to date 
 */
 
	var updateColor = propagate(function() {
		$('#combined').css({
			backgroundColor: colorString()
		});
		$('#combined-hex').html(colorString());
	});
	
/*
  ---------------
  note: you probably don't want to go creating your HTML like this =)
  generate some buttons for user input

 */
 
	function createControl(space, channel, num, valence) {
		return $('<input class="controller" type="submit" data-channel="' + num + '" data-valence="' + valence + '" value="' + channel + ': ' + valence + '16" data-space="' + space + '"/>');
	}
	
/*
  generate live controls for rgb, hsv
 */
 
	$(['RGB', 'HSV']).each(function(index, space) {
		var spacediv = $('<div>' + space + '</div>');
		$(space.split('')).each(function(num, channel) {
			var plus = createControl(space, channel, num, '+');
			var minus = createControl(space, channel, num, '-');
			var div = $('<div/>');
			div.append(plus).append(minus).append($('<span> current ' + channel + ' value: <span class="' + channel.toLowerCase() + '-int"/></span></span>'));
			spacediv.append(div);
		});
		$('#controls').append(spacediv);
	});
	
/*
  set up click handlers for the controls
 */
 
	$('#controls .controller').live('click', function() {
		
/*
     retrieve values from the dom 
 */
 
		var space = $(this).attr('data-space');
		var chan = $(this).attr('data-channel');
		var valence = $(this).attr('data-valence');
		var delta = parseInt(valence + (16).toString(), 10);
		
/*
    initials the vars that both RGB and HSV use
 */
 
		var current, channel, fn, newValue, modificationArray;
		console.log("Color space %s, channel %s, modifying %s8", space, chan, valence);
		
/*
     we have different approaches for updating if we are in RGB or HSV 
 		*/

		if (space == "RGB") {
			
/*
      convert from index to name
 		 */
 
			channel = 'rgb'.charAt(chan);
			
/*
       get the accessor
 		  */
  
			fn = color[channel];
			
/*
      get the current value
      */
      
			current = fn();
			newValue = byteConstrain(current + delta);
			
/*
       call the setter with the new val, 
       */
       
			fn(newValue);
		} else {
			
/*
       We have to deal with HSV 
       */
       
			hsv = $.Color(colorString()).toHSV();
			current = 255.0 * hsv[chan];
			newValue = current + delta;
			modificationArray = [null, null, null];
			modificationArray[chan] = byteConstrain(newValue) / 255.0;
			hsv = hsv.modify(modificationArray);
			color.r(hsv.red());
			color.g(hsv.green());
			color.b(hsv.blue());
		}
		
/*
     cancel default click handler
     */
     
		return false;
	});
	
/*
    make it so that our labels will update automagically!
      i can add these in whatever module I'd like
      no worrying about callback registration or anything. 
  */
  
	$('rgbhsv'.split('')).each(function(num, channel) {
		propagate(function() {
			var myInt = color[channel]();
			$('.' + channel + '-int').html(myInt);
		})();
	});
	
/*
 stylize color swatches for rgb

 construct hex that has the info for just the current color channel
 and 00 for the other channels
 */
 
	$('rgb'.split('')).each(function(num, channel) {
		propagate(function() {
			var bg = '#';
			var myInt = color[channel]();
			var myHex = toOctet(myInt);
			$([0, 1, 2]).each(function(index, value) {
				if (num == value) {
					bg = bg + myHex;
				} else {
					bg = bg + "00";
				}
			});
			$('#' + channel).css({
				backgroundColor: bg
			});
		})();
	});


	updateColor();
	
	
	
/*
     function that will keep a complementary color up to date 
    */
    
	var updateComplementary = propagate(function() {
		var complementary = $.Color(colorString()).complementary().toHEX();
		$('#complementary-hex').html(complementary);
		$('#complementary').css({
			backgroundColor: complementary
		});
	});
	updateComplementary();
	
/*
=== Adding Automatically Updating Analogs ===
      this is all the code required then to add automatic updating of analogs
      note that it doesnt have to worry about registering for rgb callbacks
      (that dependency is detected from colorString())
      also note that the callback for the event handler just sets values
      this way you just code the relationships between events and data
      and then the relationships between data and the view
      you keep these two things separate so it is nice and clean.
      this also lets you add other parts to the view
      without changing the event handling code

    */
    

	var analogOffsets = {
		1: propagate(30 / 360.0),
		2: propagate(330 / 360.0)
	};
	
/*
    set the swatch and the label appropriately
 */
 
	var updateAnalogous = propagate(function() {
		$([1, 2]).each(function(i, value) {
			var currentValue = parseFloat(analogOffsets[value]());
			var analog = $.Color(colorString()).analogous(currentValue).toHEX();
			$('#analog' + value.toString() + '-hex').html(analog);
			$('#analog' + value.toString()).css({
				backgroundColor: analog
			});
		});
	});
	updateAnalogous();
	
/*
    set up analog binding to selectors
 */
 
	function updateAnalogOffsetsFromSelects() {
		analogOffsets[1]($('#analog1-selector').val());
		analogOffsets[2]($('#analog2-selector').val());
	}
	$('.analog-selector').live('change', updateAnalogOffsetsFromSelects);
	updateAnalogOffsetsFromSelects();
	
/*
      and we're done!
    */
    
});
