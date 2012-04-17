Movie data visualization
=============

This project contains code to visualize movies you've seen. You can find the live version at [http://www.chloefan.com/datavis/movies](http://www.chloefan.com/datavis/movies).

Directions
----------

Currently, the way it works is that you have to download the project, upload it to a server (or localhost) in order for the CSV parser to work, and manually create a CSV file of all your movies. You can refer to movies.csv for the file format.

Ideally, this would work as a web app where you can create an account and automatically upload a .xls, .csv, or manually input your movie data.


Known issues
------------

* Word cloud is manually made and edited from Wordle. jQCloud will be used in the future, but an additional column will be needed in the CSV file with the movie keywords.

* Static ratings that you have to manually find on IMDB.

* No support for personal ratings, although you could just copy the code for the static ratings and make an extra column to input your personal ratings.
