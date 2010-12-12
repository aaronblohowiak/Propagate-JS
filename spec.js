describe('dependency tracing', {
	'before': function() {
	  propagate.reset();
		target = propagate(function(){});
	},
	
	'should have no dependencies by default': function() {
		value_of(target.composes).should_have(0, "items");
		value_of(target.composedOf).should_have(0, "items");
	},
	
	'should accurately record a dependency': function(){
	  propagate.reset();
	  var i = 0;
	  var target = propagate(function(){ console.log("in target " + (i=i+1) );});
	  target.name="target";
	  var caller = propagate(function(){ target(); });
	  caller.name = "caller";
	  
	  caller();
	  value_of(target.composes).should_include(caller);
	  value_of(caller.composedOf).should_include(target);
	  
	},
	
	'should accurately record different dependents': function(){
	  propagate.reset();
	  var target = propagate(function(){ return "hello"; });
	  var caller = propagate(function(){ target() + "moon"; });
    var callerTwo = propagate(function(){ target() + "world!"; });
	  
	  caller();
	  callerTwo();
	  
	  value_of(target.composes).should_include(caller);
	  value_of(target.composes).should_include(callerTwo);
	  value_of(target.composes).should_have(2, "items");
	},
	
	'should accurately record a dependent called multiple times': function(){
	  propagate.reset();
	  var i = 0;
	  var target = propagate(function(){ console.log("in target " + (i=i+1) ); });
	  target.name="target";
	  var caller = propagate(function(){ target(); });
	  caller.name = "caller";
	  
	  caller();
	  caller();
	  caller();
	  
	  value_of(target.composes).should_include(caller);
	  value_of(target.composes).should_have(1, "items");
	  value_of(caller.composedOf).should_have(1, "items");
	}
});

describe('propagating value changes', {
  'before each': function(){
    val = "hello";
    propval = propagate(val);
  },
  
  'a value should turn into a function': function() {
		value_of(typeof(propval)).should_be("function");
	},
	
	'returned function should return initial value by default': function() {
		value_of(propval()).should_be("hello");
	},
	
	'returned function should return new value after set': function() {
    propval("aloha");
		value_of(propval()).should_be("aloha");
	},
	
	'should accurately record different dependents': function(){
	  propagate.reset();
	  var target = propagate("hello");
	  var caller = propagate(function(){ target() + "moon"; });
    var callerTwo = propagate(function(){ target() + "world!"; });
	  
	  caller();
	  callerTwo();
	  
	  value_of(target.composes).should_include(caller);
	  value_of(target.composes).should_include(callerTwo);
	  value_of(target.composes).should_have(2, "items");
	},
	
	'should call dependents': function(){
    propagate.reset();
    var outOne = '';
    var outTwo = '';
    var target = propagate("hello");
    var caller = propagate(function(){ outOne = target() + " moon"; });
    var callerTwo = propagate(function(){ outTwo = target() + " world!"; });

    caller();
    callerTwo();
    value_of(outOne).should_be("hello moon");
		value_of(outTwo).should_be("hello world!"); 
		
		target("aloha");
		
		value_of(outOne).should_be("aloha moon");
		value_of(outTwo).should_be("aloha world!"); 
	},
	
	'should track dependents through non-instrumened functions.': function(){
    propagate.reset();
    var outOne = '';
    var outTwo = '';
    var target = propagate("hello");
    var caller = function(){ return target() + " moon"; };
    var callerTwo = propagate(function(){ outTwo = caller() + "!!!"; });

    callerTwo();
		value_of(outTwo).should_be("hello moon!!!"); 
		
		target("aloha");
		
		value_of(outTwo).should_be("aloha moon!!!");
	},
	
	'should call dependents\' dependents': function(){
    propagate.reset();
    var outOne = '';
    var outTwo = '';
    var target = propagate("hello");
    var caller = propagate(function(){ return outOne = target() + " moon"; });
    var callerTwo = propagate(function(){ outTwo = caller() + "!!!"; });

    caller();
    callerTwo();
    value_of(outOne).should_be("hello moon");
		value_of(outTwo).should_be("hello moon!!!"); 
		
		target("aloha");
		
		value_of(outOne).should_be("aloha moon");
		value_of(outTwo).should_be("aloha moon!!!");
	}
	
	//premature optimization
  // 'should avoid duplicate calls': function(){
  //     propagate.reset();
  //     var outOne = '';
  //     var callcount = 0;
  //     var target = propagate("hello");
  //     
  //     var caller = propagate(function(){ 
  //       callcount = callcount + 1;
  //       outOne = target() + " moon, " + target(); 
  //     });
  // 
  //     caller();
  //     value_of(outOne).should_be("hello moon, hello");
  //     value_of(callcount).should_be(1);
  //  
  //     target("aloha");
  //      
  //     value_of(outOne).should_be("aloha moon, aloha");
  //     value_of(callcount).should_be(2);
  // }
});
