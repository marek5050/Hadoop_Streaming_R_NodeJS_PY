#Hadoop Streaming with Node JS or Python on Yosemite

[Introduction][intro]  
[Configuring HADOOP_HOME][HADOOP_HOME]  
[Locating Hadoop Streaming JAR ][JAR]  
[Configure a Mapper][MAPPER]  
[Configure a Reducer][REDUCER]  
[Download and upload Datasources][DATASOURCES]  
[Run the Map/Reduce job][RUN]  
[Download the results][RESULTS]  
 

+ **References**
+ [Apache Hadoop Streaming Official Page](http://hadoop.apache.org/docs/r1.2.1/streaming.html)
+ [Writing an MapReduce Program in Python](http://www.michael-noll.com/tutorials/writing-an-hadoop-mapreduce-program-in-python/)
+ [A wordcount program using R on Apache Hadoop](http://rstudio-pubs-static.s3.amazonaws.com/9217_9d7ed5103a9e4c6db2f8987eac8173d3.html)

##Introduction[intro]
For the most part I followed the Writing an MapReduce Program in Python tutorial. However there are a couple of differences in configuration due to Brew. I also wanted to test it out with NodeJS. So if you followed the Installing Hadoop on Mavericks tutorial then this is how you would do Hadoop streaming. 

---

##Configuring HADOOP_HOME[HADOOP_HOME]  
Open up the terminal and check whether you have HADOOP_PATH configured.

% echo $HADOOP_PATH

If empty then we need to find the installation directory of Hadoop and configure the HADOOP_PATH variable. 

a. If installed using Brew it'll be /usr/local/Cellar/hadoop/<-version-> 
b. OR in the terminal execute.
 	   
	% find /usr/local/Cellar \-name '*hadoop*' -print
	/usr/local/Cellar/hadoop/2.6.0...

Using your favorite text editor add the path to ~/.profile

	% vim ~/.profile

Add the line:
	
	export HADOOP_HOME=/usr/local/Cellar/hadoop/<-version->
 
Save and close profile, then execute

	% source ~/.profile
 
##Locating Hadoop Streaming JAR[JAR]  
 
Inside the Hadoop Home directory we'll also need to locate the hadoop streaming jar,  ie. hadoop-streaming-2.6.0.jar. 
 
	% find $(echo $HADOOP_HOME) \-name '*streaming*' -print
	/usr/local/Cellar/hadoop/2.6.0/libexec/share/hadoop/tools/lib/hadoop-streaming-2.6.0.jar  

You'll need this file to run the streaming job a couple of sections down. 

##Configure a Mapper[MAPPER]  

[code]

	#!/opt/local/bin/node	
	process.stdin.setEncoding('utf8');

	/* http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript */
	
	function replaceAll(find, replace, str) {
	  return str.replace(new RegExp(find, 'g'), replace);
	}
	
	process.stdin.on('readable', function() {
	  var chunk = process.stdin.read();
	  if (chunk !== null) {
	    chunk = replaceAll('\t',' ',chunk);
    	chunk = replaceAll('\n',' ',chunk);
	    chunk = chunk.trim();
	    var words = chunk.split(' ');
	    for(word in words){
			console.log(words[word]+'\t'+1);
    	}
	  }
	});
[/code]
In the above code just replace 

	/opt/local/bin/node

with the path to your own NodeJS. Which can be found by doing 

	% which node
	/opt/local/bin/node
	
To make it executable execute

	% chmod +x ./mapper.js

To test out the script run

	% echo 'The big brown fox ran up the stairs, the big brown bear walked down.' | ./mapper.js
	The	1
	big	1
	brown	1
	fox	1
	ran	1
	up	1
	the	1
	stairs,	1
	the	1
	big	1
	brown	1
	bear	1
	walked	1
	down.	1
	
Every word should be printed with a 1 next to it. 

##Configure a Reducer[REDUCER]  

[code]
	#!/opt/local/bin/node
		
	process.stdin.setEncoding('utf8');
	var current_word='';
	var current_count=0;

	process.stdin.on('readable', function() {
	  var chunk = process.stdin.read();
	  if (chunk !== null) {
	    chunk = chunk.trim();
	    var arr = chunk.split('\n');
	   for(word in arr){

    	var tuple = arr[word].split('\t');
	    var word = tuple[0];
	    var count = parseInt(tuple[1]);

    	 if(current_word==word){
			current_count+= count;
     }else{
		if(current_word) 
			console.log(current_word +'\t' + current_count);
		current_word = word;
		current_count = count;
       } 	
     }
    if(current_word == word)
		console.log(current_word + '\t'+ current_count);
	  }
	});
[/code]

Again to make it executable execute

	% chmod +x ./reducer.js

To test the Reducer we have to sort the input first and then pipe it. 

	echo 'The big brown fox ran up the stairs, the big brown bear walked down.' | ./mapper.js | sort -k1,1 | ./reducer.js
	The	1
	bear	1
	big	2
	brown	2
	down.	1
	fox	1
	ran	1
	stairs,	1
	the	2
	up	1
	walked	1

With a working mapper and reducer now we can fetch some real data.

##Download and upload Datasources[DATASOURCES]  

Project Gutenberg has a bunch of free online literature so download a book from there, for example [Historical Tours in and about Boston by American Oil Corporation](http://www.gutenberg.org/ebooks/48054). Use CURL to download the book.

	% curl http://www.gutenberg.org/cache/epub/48054/pg48054.txt > historical_tours.txt
	
Now we need to upload it to HDFS

	% hdfs dfs -put ./historical_tours.txt .
	
##Run the Map/Reduce job[RUN]
Now with everything ready we are ready to combine the 3 elements into a single command. 

	% hadoop jar /usr/local/Cellar/hadoop/2.6.0/libexec/share/hadoop/tools/lib/hadoop-streaming-2.6.0.jar \
	-file ./mapper.js -mapper ./mapper.js  \
	-file ./reducer.js  -reducer ./reducer.js \
	-input ./historical_tours.txt -output ./historical-out
	
	
![Successful job](http://amodernstory.files.wordpress.com/2015/01/wpid-screen-shot-2015-01-24-at-12-10-30-pm.png)

##Download the results[results]
Head over to the hdfs manager at http://127.0.0.1:50070/explorer.html and navigate to the '/user/<-username->/historical-out/' directory to find the part-00000 file.

The output should have been something like this

	1	NaN
	'America'	1
	'Boston	1
	'Brimstone	1
	'Bulfinch'	1
	'Captain	1
	'Common	1
	'Constitution'	1
	'Constitution,'	1
	'Defects,'	1
	'Do	1
	'Duxbury-Marshfield.'	1
	'Five	1
	'Fort	1
	'Harvard	1
	'Here	1
	'I	1

