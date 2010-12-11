propagate = (function(){
  var tracingStack = [];
  
  function removeFromArray(obj, name, item){
    var i = 0;
    while(i < obj[name].length){
      if(obj[name][i] == item){
        return obj[name].splice(i, 1);
      }
      i = i+1;
    }
  };
  
  function trace(accessed){
    var tracingStackDepth = tracingStack.length;
  
    if( tracingStackDepth > 0){
       var caller = tracingStack[ tracingStackDepth - 1 ];
       accessed.composes.push(caller);
       caller.composedOf.push(accessed);
       
       console.log("tracing", caller.fn.toString(), "adding dependent", accessed.fn.toString());
    };
  };
  
  
  function clearDependencies(fn){
    var child = null;
    
    for (var i=0; i < fn.composedOf.length; i++) {
      child = fn.composedOf[i];
      removeFromArray(child, "composes", fn);
    };
    
    fn.composedOf = [];
  };
  
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
  };
  
  function wrapAsAccessor(val){
    function wrappedFn(){  
      
      if(arguments.length == 0){
        trace(wrappedFn);
        return val;
      }else{
        val = arguments[0];
        console.log("I need to re-evaluate these:");
        for (var i = wrappedFn.composes.length - 1; i >= 0; i--){
          console.log(wrappedFn.composes[i].fn.toString());
        };
      }
      return result;
    }

    wrappedFn.val = val;
    wrappedFn.composedOf = []; //should always be empty!
    wrappedFn.composes = [];
    return wrappedFn;
  };
  
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
