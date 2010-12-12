#Propagate-JS

# CURRENTLY IN DEVELOPMENT
## What?
###Simple change propagation for JS.

    var obj = propagate({
      'title': "propagate-JS",
      'version': "0.0.1"
    })

    propagate(function(){
      console.log(obj.title()+" "+obj.version());
    })
    //gets called immediately, will output "propagate-JS 0.0.1" to console

    obj.version("0.0.2");
    //outputs "propagate-JS 0.0.2" to console

Re-call every instrumented function that accessed data when the data changes.

This lets data changes propagate out so you can automatically refresh derived values.

This should work in the browser as well as on the server.

## Composability 

Here we demonstrate that you can have propagation through multiple levels.

    var obj = propagate({
      'timeLeft': 10
    })

    var announcement = propagate(function(){
      var count = obj.timeLeft();
      if(count > 0){
        return count.toString();
      }else{
        return "blastoff!!";
      }
    })

    propagate(function(){
      console.log("The announcer says: " + announcement());
    })

    function countDown(){
      var t = obj.timeLeft();
      obj.timeLeft(t - 1);
      if(t > 0){
        setTimeout(countDown, 1000);
      }
    }
    
    
## Why?
Libraries like KnockoutJS, Backbone and SproutCore are monolithic. To me, this function call dependency graph magic was the interesting part. Further, I avoided polluting the global namespace.

## Who?
  Aaron Blohowiak
  
  The spec infrastructure (but not spec itself) has a different author and license.
  
  This code is heavily inspired by the great work of Steve Sanderson, et al on KnockoutJs (knockoutjs.com)

## LICENSE

Copyright (c) 2010 Aaron Blohowiak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.