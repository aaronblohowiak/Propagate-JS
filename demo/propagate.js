if (typeof console == "undefined" || typeof console.log == "undefined")
  var console = { log: function() {} };
  
propagate = (function () {
  var tracingStack = [];
  
  //utility function that removes an item from an array on obj
  function removeFromArray (obj, name, item) {
    var i = -1, arr = obj[name], l = arr.length;
    while (++i < l) {
      if (arr[i] == item) return arr.splice(i, 1);
    }
    return null;
  }
  
  function trace (accessed) {
    var depth = tracingStack.length
      , caller;
    if (depth) {
       caller = tracingStack[ depth - 1 ];
       accessed.composes.push(caller);
       caller.composedOf.push(accessed);
       
       //console.log("tracing", caller.fn.toString(), "adding dependent", accessed.fn.toString());
    }
  }
  
  function clearDependencies(fn){
    var child = null;
    
    for (var i=0, l = fn.composedOf.length; i < l; i++) {
      child = fn.composedOf[i];
      removeFromArray(child, "composes", fn);
    }
    
    fn.composedOf = [];
  }
  
  function callDependents(wrappedFn){
    var c = wrappedFn.composes 
      , i = c.length;
    while (i--) {
      if (typeof(c[i].fn) == "function") {
        c[i].fn();
        callDependents(c[i]);
      }
    }
  }
  
  function wrap(fn){
    function wrappedFn(){
      clearDependencies(wrappedFn);
      
      trace(wrappedFn);
      
      tracingStack.push(wrappedFn);
      var result = fn();
      tracingStack.pop();
      return result;
    }

    wrappedFn.fn = fn;
    wrappedFn.composedOf = [];
    wrappedFn.composes = [];
    return wrappedFn;
  }
  
  
  function wrapAsAccessor(val){
    function wrappedFn(){  
      if (arguments.length) {
        val = arguments[0];
        callDependents(wrappedFn);
      } else {
        trace(wrappedFn);
      }
      return val;
    }

    wrappedFn.fn = function(){ return val; }; //for completeness
    wrappedFn.composedOf = []; //should always be empty!
    wrappedFn.composes = [];
    return wrappedFn;
  }
  
  function propagate(arg){
    if(typeof(arg) == "function"){
      return wrap(arg);
    }else{
      return wrapAsAccessor(arg);
    }
  }
  
  propagate.reset = function(){
    tracingStack = [];
    traced = {};
  };
  
  return propagate;
})();
