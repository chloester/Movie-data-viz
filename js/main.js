var dayIndex = 0;
var dateIndex = 1;
var timeIndex = 2;
var movieIndex = 3;
var priceIndex = 4;
var ratingIndex = 5;

var raw;
var totalMovies;
var lowestRatingRange; // x.0
var highestRatingRange; // x.0

jQuery(function() {
    jQuery.get("movies.csv", processData);
});

function processData(data) {
    raw = jQuery.csv()(data);
    totalMovies = raw.length - 1
    
    row1Stats();
    row2Stats();
    row34Stats();
    row5Stats();
}

/////////////////////////// ROW 1 ///////////////////////////

function row1Stats() {
    // total movies seen
    $("#totalMovies").text(totalMovies);
    
    // total amount spent & average IMDB rating
    var totalAmount = 0;
    var totalRating = 0;
    for(var i = 1; i < raw.length; i++) {
        totalAmount += parseFloat(raw[i][priceIndex]);
        totalRating += parseFloat(raw[i][ratingIndex]);
    }
    $("#totalAmount").text("$"+totalAmount);
    var averageRating = (totalRating / totalMovies).toFixed(1);
    $("#averageRating").text(averageRating);
    
    // average price per ticket
    var averageAmount = (totalAmount / totalMovies).toFixed(2);
    $("#averageAmount").text("$"+averageAmount);
    
}

/////////////////////////// ROW 2 ///////////////////////////

function row2Stats() {
    // lowest & highest rated movie
    var topNum = 10;
    
    var ratingSort = raw.slice(1);
    ratingSort.sort(function(a, b) {
       return a[ratingIndex] - b[ratingIndex];
    });
    
    lowestRatingRange = parseFloat((ratingSort[0][ratingIndex]).slice(0,1));
    highestRatingRange = parseFloat((ratingSort[ratingSort.length-1][ratingIndex]).slice(0,1));
        
    var lowestMovies = $("#lowestMovies");
    for(var i = 0; i < topNum; i++) {
        lowestMovies.append($("<li><big><strong>" + ratingSort[i][movieIndex] + " </strong></big><small>" + (parseFloat(ratingSort[i][ratingIndex])).toFixed(1) + "</small></li>"));
    }
    
    var highestMovies = $("#highestMovies");
    var foundCount = 0;
    var duplicates = [];
    for(var i = (ratingSort.length-1); i >= 0; i--) {
        var movieName = ratingSort[i][movieIndex];
        if (duplicates.indexOf(movieName) == -1) duplicates.push(movieName);
        else continue;
        highestMovies.append($("<li><big><strong>" + movieName + " </strong></big><small>" + (parseFloat(ratingSort[i][ratingIndex])).toFixed(1) + "</small></li>"));
        if(++foundCount >= topNum) break;
    }
    
    // rating distribution
    createRatingDistribution();
        
}

function createRatingDistribution() {
    var chart;
    var xcats = [];
    // setup variables
    for(var i = 0; i < (highestRatingRange-lowestRatingRange+1); i++) {
        xcats.push(lowestRatingRange+i);
    }
    var counts = [];
    for(var i = 0; i < xcats.length; i++) {
        counts[i] = 0;
    }
    for(var i = 1; i < raw.length; i++) {
        // for each, check rating number and increment rating count for that bucket
        var currentScore = parseInt((raw[i][ratingIndex]).slice(0,1));
        counts[currentScore-lowestRatingRange]++;
    }
    xcats.reverse();
    counts.reverse();
    
    $(document).ready(function() {
       chart = new Highcharts.Chart({
          chart: {
             renderTo: 'ratingDist',
             defaultSeriesType: 'bar',
             marginLeft: 15,
             marginRight:5,
             height:223
          },
          title: {
             text: ''
          },
          xAxis: {
             categories: xcats,
             title: {
                text: ''
             },
             lineColor: '#000000',
             tickColor: '#000000',
          },
          yAxis: {
             min: 0,
             gridLineWidth: 0,
             labels: {
                 enabled: false
             },
             title: {
                 text: ''
             }
          },
          tooltip: {
             enabled: false
          },
          plotOptions: {
             bar: {
                dataLabels: {
                   enabled: true,
                   color: '#000000'
                },
                borderColor: '#000000',
                color: '#FFCC00',
                groupPadding: 0,
                pointPadding: 0,
                marker: false,
                shadow: false
             }
          },
          legend: {
             enabled: false
          },
          credits: {
             enabled: false
          },
          series: [{
             data: counts
          }]
       });


    });
}

/////////////////////////// ROW 3 + 4 ///////////////////////////

function row34Stats() {
    // last movie seen
    var lastMovie = raw[raw.length-1][movieIndex];
    var lastRating = raw[raw.length-1][ratingIndex];
    $("#lastSeen").append($("<big><strong>"+lastMovie+" </strong></big><small>"+lastRating+"</small>"));

    // ratings by year
    var ratingsByYear = [];
    var midnightShowings = $("#midnightShowings");
    var multipleShowings = $("#multipleShowings");
    var averageOfFirstTenMovies = 0;
    var averageOfLastTenMovies = 0;
    var firstDate;
    var lastDate;
    var trendlineData;
    
    // calculate trendline beginning and end point
    for(var i = 1; i < 11; i++) {
        averageOfFirstTenMovies += parseFloat(raw[i][ratingIndex]);
        averageOfLastTenMovies += parseFloat(raw[raw.length-i][ratingIndex]);
    }
    firstDate = parseDate(raw[1][dateIndex]);
    lastDate = parseDate(raw[raw.length-1][dateIndex]);
    averageOfFirstTenMovies /= 10;
    averageOfLastTenMovies /= 10;
    trendlineData = [[firstDate,averageOfFirstTenMovies],[lastDate,averageOfLastTenMovies]];
    
    // row 5 time graph
    var moviesSeenAtEachHourDay = [];
    
    for(var i = 1; i < raw.length; i++) {
        // ratings by year
        var date = parseDate(raw[i][dateIndex]);
        var rating = parseFloat(raw[i][ratingIndex]);
        var newRow = [date, rating];
        ratingsByYear.push(newRow);
        
        // midnight showings
        var timeString = raw[i][timeIndex];
        var hourString = timeString.split(":");
        var hour = parseInt(hourString[0]);
        if (hour == 23 || hour == 0) {
            var movieName = raw[i][movieIndex];
            midnightShowings.append($("<li><big><strong>" + movieName + " </strong></big><small>" + timeString + "</small></li>"));
        }
    }
    
    createRatingsByYear(ratingsByYear, trendlineData);
    
    // multiple showings
    // for each name, check with array 1, if doesn't exist, add, if exists, add to array 2
    var duplicates = findDuplicates(raw);
    for(var i = 0; i < duplicates.length; i++) {
        multipleShowings.append($("<li><big><strong>" + duplicates[i] + "</strong</big></li>"));
    }
}

function parseDate(dateString) {
    var dateStringList = dateString.split("/");
    var newDate = Date.UTC(parseInt(dateStringList[2]), parseInt(dateStringList[0]-1), parseInt(dateStringList[1]));
    return newDate;
}

function findDuplicates(movies) {
    // finds duplicates in movie array and returns their names and count
    var duplicates = [];
    var compareTo = [];
    for(var i = 1; i < movies.length; i++) {
        var currentMovie = movies[i][movieIndex];
        if (compareTo.indexOf(currentMovie) == -1) compareTo.push(currentMovie);
        else duplicates.push(currentMovie);
    }
    return duplicates;
}

function createRatingsByYear(data, trendData) {
    var chart;
    $(document).ready(function() {
    	chart = new Highcharts.Chart({
    		chart: {
    			renderTo: 'ratingYear',
    			type: 'scatter',
                height: 250,
    			marginLeft: 25,
    		},
    		legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                scatter: {
                    color: 'rgba(255, 204, 0, .7)'
                },
                line: {
                    color: '#000000',
                    shadow: false
                }
            },
    		title : {
    		    text: null
    		},
    		tooltip: {
    		    enabled: true
    		},
    		xAxis: {
    			type: 'datetime',
    			dateTimeLabelFormats: {
    				year: '%Y'
    			},
    			title: {
    			    text: null
    			},
    			minorTickInterval: 1000 * 60 * 60 * 24 * 365
    		},
    		yAxis: {
    			tickInterval: 1,
    			title: {
    			    text: null
    			}
    		},
    		series: [{
    		    type: 'scatter',
    		    name: 'Rating',
    			data: data
    		}, {
    		    type: 'line',
    		    name: 'Regression Line',
    		    data: trendData,
    		    marker: {
    		        enabled: false
    		    },
    		    enableMouseTracking: false
    		}]
    	});
    });
}

/////////////////////////// ROW 5 ///////////////////////////

function row5Stats() {
    var daysOfTheWeekCounts = {"Monday":0,"Tuesday":0,"Wednesday":0,"Thursday":0,"Friday":0,"Saturday":0,"Sunday":0};
    
    // create day data ordered by highest percentage
    for(var i = 1; i < raw.length; i++) {
        var dayOfWeek = raw[i][dayIndex];
        daysOfTheWeekCounts[dayOfWeek] += 1;
    }
    var daysOfTheWeekData = convertObjectToArray(daysOfTheWeekCounts);
    var daysOfTheWeekDataSorted = daysOfTheWeekData.slice(0);
    daysOfTheWeekDataSorted.sort(function(a, b) {
       return b[1] - a[1];
    });
    var daysOfTheWeekDataPercentage = convertToPercentage(daysOfTheWeekDataSorted);
    createDayPieChart(daysOfTheWeekDataPercentage);
    
    // organize time data
    var daysOfTheWeekNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    var everyHourOfEveryDay = [];
    for(var i = 0; i < daysOfTheWeekNames.length; i++) {
        var day = daysOfTheWeekNames[i];
        for(var j = 0; j < 24; j++) {
            everyHourOfEveryDay.push([day, j, 0]);
        }
    }
    for(var i = 1; i < raw.length; i++) {
        var timeString = raw[i][timeIndex];
        var hourString = timeString.split(":");
        var hour = parseInt(hourString[0]);
        
        var day = raw[i][dayIndex];
        var dayNumber = 0;
        if (day == "Monday") dayNumber = 6;
        if (day == "Tuesday") dayNumber = 5;
        if (day == "Wednesday") dayNumber = 4;
        if (day == "Thursday") dayNumber = 3;
        if (day == "Friday") dayNumber = 2;
        if (day == "Saturday") dayNumber = 1;
        if (day == "Sunday") dayNumber = 0;
        
        everyHourOfEveryDay[dayNumber*24+hour][2]++;
    }
    
    var timeData = [];
    for(var i = 0; i < everyHourOfEveryDay.length; i++) {
        timeData.push(everyHourOfEveryDay[i][2]);
    }    
    createDotChart(timeData);
}

function convertObjectToArray(object) {
    var convertedArray = [7];
    convertedArray[0] = ["Monday",object.Monday];
    convertedArray[1] = ["Tuesday",object.Tuesday];
    convertedArray[2] = ["Wednesday",object.Wednesday];
    convertedArray[3] = ["Thursday",object.Thursday];
    convertedArray[4] = ["Friday",object.Friday];
    convertedArray[5] = ["Saturday",object.Saturday];
    convertedArray[6] = ["Sunday",object.Sunday];
    return convertedArray;
}

function convertToPercentage(array) {
    var percentageArray = [];
    for(var i = 0; i < array.length; i++) {
        var percentage = array[i][1]/totalMovies*100;
        percentageArray[i] = [array[i][0], parseInt(percentage)];
    }
    return percentageArray;
}

function createDayPieChart(daysOfTheWeekData) {
	chart = new Highcharts.Chart({
		chart: {
			renderTo: 'dayPieChart',
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			marginTop: -120,
		},
		title: {
			text: ''
		},
		colors: [
		    '#FFCC00',
		    '#FFD500',
		    '#FFDD00',
		    '#FFE600',
		    '#FFEE00',
		    '#FFF700',
		    '#FFFF00'
		],
		credits: {
            enabled: false
		},
		tooltip: {
			formatter: function() {
				return '<b>'+ this.point.name +'</b>: '+ (this.percentage).toFixed(0) +' %';
			}
		},
		plotOptions: {
			pie: {
				allowPointSelect: false,
				dataLabels: {
					enabled: true,
					color: '#000000',
					connectorColor: '#000000',
					formatter: function() {
						return '<b>'+ this.point.name +'</b>: '+ (this.percentage).toFixed(0) +' %';
					},
					distance: -1,
				},
				borderWidth: 2,
				shadow: false,
				innerSize: '25%',
			}
		},
		series: [{
			type: 'pie',
			data: daysOfTheWeekData
		}]
	});
}

function createDotChart(data) {
    var r = Raphael("timeChart"),
                        xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                        ys = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
                        data = data,
                        axisy = ["Sun", "Sat", "Fri", "Thu", "Wed", "Tue", "Mon"],
                        axisx = ["12am", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12pm", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

                    r.dotchart(0, 0, 620, 240, xs, ys, data, {symbol: "o", max: 10, heat: true, axis: "0 0 1 1", axisxstep: 23, axisystep: 6, axisxlabels: axisx, axisxtype: " ", axisytype: " ", axisylabels: axisy}).hover(function () {
                        this.marker = this.marker || r.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
                        this.marker.show();
                    }, function () {
                        this.marker && this.marker.hide();
                    });
}
