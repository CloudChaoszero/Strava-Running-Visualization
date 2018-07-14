var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom:80,
    left:100
}

var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#chart")
            .append("svg")
            .attr("width",svgWidth)
            .attr("height",svgHeight+5);

var chartGroup = svg.append("g")
                .attr("transform",`translate(${margin.left},${margin.top-2})`);


var table_parent = d3.select(".table-data")
var d3table = table_parent.append('table')

thead = d3.select("table").selectAll("th")
.data(["Activity ID","Distance"]).enter().append("th").text(function(d){return d})


d3.json("../db/MainDataset.json",function(error,JSONdata){
    if(error){
        console.error()
    }


    var barSpacing = 10;
    var scaleY = 10;
    var barWidth = 10;

    var data = d3.nest().key(function(d){return d.ActivityID;})
                        .rollup(function(d){
                            return d3.max(d, function(g){return g.Distance * 0.000621371;});
                        }).entries(JSONdata);
   data.forEach(function(d){
        d.ActivityID = d.key;
        d.Distance = d.value;
    });

    var xBandScale = d3.scaleBand()
                    .domain(data.map(d => d.ActivityID))
                    .range([width,0])
                    .padding(0.1);
    var yLinearScale = d3.scaleLinear()
                    .domain([0,d3.max(data,d=>d.Distance)])
                    .range([height,0]);
    

    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    chartGroup.append("g").call(leftAxis);
    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)
    .selectAll("text")
    .attr("y",0)
    .attr("x",-50)
    .attr("transform","rotate(-65)");

    data.forEach(function(d){
        d.Distance = +d.Distance;


        //Impute data into table
        var d3row = d3table.append('tr');
        var row_a=[];
        for (key in d){row_a.push(d[key])}
        row_a.slice(0,2).forEach(function(el){d3row.append('td');});
        var d3td_hd = d3row.selectAll('td').data(row_a.slice(0,2));
        
        d3td_hd.text(function(d){return d;});
    });
    
    var barsGroup = chartGroup.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .classed("bar", true)
    .attr("width", d => xBandScale.bandwidth())
    .attr("height", d => height - yLinearScale(d.Distance))
    .attr("x", (d, i) => xBandScale(d.ActivityID))
    .attr("y", d => yLinearScale(d.Distance));
    

    /* X and Y Axis Labels*/
    chartGroup.append("text")
            .attr("text-anchor","middle")
            .attr("transform",`translate(${-50}, ${svgHeight/3})rotate(-90)`)
            .text("Miles");
    chartGroup.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (svgWidth/2) +","+(svgHeight-(100/5)+5)+")")  // centre below axis
            .text("Activity ID");
/*Tooltip*/
    var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([0, -60])
            .html(function(d) {
              return (`<strong>Distance:</strong> <font color="blue">${d.Distance.toFixed(2)}</font>`);
            });

        chartGroup.call(toolTip);
      


    
    barsGroup.on("mouseover",function(d){
        toolTip.show(d)
         .style("opacity", .9);
        d3.select(this)
            .transition()
            .duration(1000)
            .attr("fill","red");
    })
    .on("mouseout",function(d){
        d3.select(this)
        .transition()
        .duration(1000)
        .attr("fill","black");
        toolTip.hide(d);
    })
    


});