#!/opt/local/bin/node

process.stdin.setEncoding('utf8');
var current_word="";
var current_count=0;

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    chunk = chunk.trim();
    var arr = chunk.split("\n");
   for(word in arr){

    var tuple = arr[word].split("\t");
    var word = tuple[0];
    var count = parseInt(tuple[1]);

     if(current_word==word){
	current_count+= count;
     }else{
	if(current_word) console.log(current_word +"\t" + current_count);
	current_word = word;
	current_count = count;
     } 	
   
   }
    if(current_word == word)
	console.log(current_word + "\t"+ current_count);
  }
});

process.stdin.on('end', function() {
//  process.stdout.write('end');
});
