#!/opt/local/bin/node

process.stdin.setEncoding('utf8');

/* http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript */
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    chunk = replaceAll("\t"," ",chunk);
    chunk = replaceAll("\n"," ",chunk);
    chunk = chunk.trim();
    var words = chunk.split(" ");
    for(word in words){
	console.log(words[word]+"\t"+1);
    }
  }
});
