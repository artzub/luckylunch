/**
 * Created by artzub on 03.09.2014.
 */
"use strict";

L.TrendBarLayer = L.Class.extend({
    options : {
        position : 'bottomleft'
        , keepOpen : true
    },

    initialize : function(options) {
        this.options = L.Util.setOptions(this.options, options);
    },

    onAdd: function (map) {
        if (this._map == map && this.bar) {
            this.bar.show();
            return;
        }

        this._map = map;

        this.options.position = this.options.position || "bottomleft";

        this.bar = d3.select(map._controlContainer).insert('div', 'firstChild');
        this.bar.classed('leaflet-layer-trend' +
            (this.options.keepOpen ? ' open' : '') +
            ' ' + this.options.position, true);

        this.trendBar = trendBar(this.bar);


        this.bar.lastpostion = this.options.position;

        this.bar.hide = function() {
            this.style('display', 'none');
        };

        this.bar.show = function() {
            this.style('display', null);
        };
    },

    appendData : function (data) {
        this.trendBar.append(data);
    },

    clearData : function () {
        this.trendBar.clear();
    },

    addTo : function(map) {
        map.addLayer(this);
        return this;
    },

    getPosition : function() {
        return this.bar ? this.bar.lastpostion || this.options.position : this.options.position;
    },

    setPosition : function(position) {
        this.options.position = position || this.options.position;
        if (this.bar) {
            this.bar.classed(this.bar.lastpostion, false);
            this.bar.lastpostion = this.options.position;
            this.bar.classed(this.bar.lastpostion, true);
        }
    },

    onRemove: function() {
        this.bar.hide();
    }
});

L.trendBar = function(options) {
    return new L.TrendBarLayer(options);
};

function trendBar(div, w, h) {

    div = div.empty ? div : d3.select(div);

    var margin = {top: 20, right: 45, bottom: 30, left: 35}
        , width = (w || div.node().clientWidth) - margin.left - margin.right
        , height = (h || div.node().clientHeight) - margin.top - margin.bottom

        , formatSum = d3.format(",")

        , x = d3.time.scale()
            .range([0, width])

        , y = d3.scale.linear()
            .range([height, 0])

        , yI = d3.scale.linear()
            .range([height, 0])

        , color = d3.scale.category10()

        , xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")

        , yAxis = d3.svg.axis()
            .scale(y)
            .tickFormat(d3.format("d"))
            .orient("left")

        , yAxisI = d3.svg.axis()
            .scale(yI)
            .orient("right")

        , line = d3.svg.area()
//            .interpolate(interpolateSankey)
//            d3.svg.line()
//            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            .y0(height)
            .y1(function(d) { return y(d.value); })

        , lineI = d3.svg.area()
//            .interpolate(interpolateSankey)
//            d3.svg.line()
//            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            .y0(height)
            .y1(function(d) { return yI(d.value); })

        , svg = div.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        , axisXBlock
        , axisYBlock
        , axisYBlockI
        , groups
        , lines
        , vlines
        ;

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("transform", "translate(1,0)")
        .attr("width", width - 2)
        .attr("height", height);

    var data = [
            {
                name : 'orders',
                class : 'area',
                values : []
            },
            {
                name : 'sums',
                class : 'areaSum',
                values : []
            }
        ]
        ;
    color.domain(data.map(function(d) {
        return d.name;
    }));

    function append(newData) {
        if (!newData || !newData.length)
            return;

        var mediumDate = d3.median(newData, function(d) {
            return d.date;
        });

        data[0].values.push({
            date : mediumDate,
            value : newData.length
        });
        data[1].values.push({
            date : mediumDate,
            value : d3.sum(newData, function(d) {
                return +d;
            })
        });
        update();
    }

    function objectDate(d) {
        return d.date;
    }

    function objectDateAsDate(d) {
        return new Date(d.date);
    }

    function objectValue(d) {
        return d.value;
    }

    function getLine(d) {
        return d == data[0] ? line(d.values) : lineI(d.values);
    }

    function update() {
        if(!data[0].values.length)
            return;

        axisXBlock = axisXBlock || svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
        ;
        axisXBlock.call(xAxis);

        axisYBlock = axisYBlock || svg.append("g")
            .attr("class", "y axis")
        ;
        axisYBlock.call(yAxis);

        axisYBlockI = axisYBlockI || svg.append("g")
            .attr("class", "y axis")
        ;
        axisYBlockI
            .attr("transform", "translate(" + width + ",0)")
            .call(yAxisI);

        axisYBlock.selectAll('.titleAxis').empty()
            && axisYBlock
                .append("text")
                .attr('class', 'titleAxis')
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Max")
        ;

        axisYBlockI.selectAll('.titleAxisI').empty()
            && axisYBlockI
                .append("text")
                .attr('class', 'titleAxisI')
                .attr("transform", "rotate(-90)")
                .attr("y", -16)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Amount")
        ;

        var ext = d3.extent(data[0].values, objectDate);
        if (ext.length) {
            ext[0] = ext[0] - 10000;
        }

        x.domain(ext);

        y.domain([
            0, //d3.min(data[0].values, objectValue),
            d3.max(data[0].values, objectValue)
        ]);
        yI.domain([
            0, //d3.min(data[1].values, objectValue),
            d3.max(data[1].values, objectValue)
        ]);

        groups = groups || svg.selectAll(".metric")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "metric")
        ;

        lines = lines || groups.append("path")
            .attr("class", function(d) { return d.class; })
        ;
        lines.attr("d", getLine);

        svg.selectAll(".vline")
            .data(data[0].values.map(objectDate))
            .enter()
            .append('line')
            .attr('class', 'vline')
        ;

        svg.selectAll(".vline")
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', height)
        ;

        if (!hotLine) {
            hotLine = svg.append("g")
                .attr("class", "hotLine")
            ;

            hotLine.append('line')
                .attr('y1', 0)
                .attr('y2', height)
            ;

            hotLineCircle = hotLine.append("g").attr('class', 'hotLineC');

            hotLineCircle.append("circle")
                .attr("r", 3);

            hotLineCircle.append("text")
                .attr("x", 6)
                .attr("dy", ".35em");

            hotLineCircleI = hotLine.append("g").attr('class', 'hotLineCI');

            hotLineCircleI.append("circle")
                .attr("r", 3);

            hotLineCircleI.append("text")
                .style("text-anchor", "end")
                .attr('class', 'hotLineCItext')
                .attr("x", -6)
                .attr("dy", ".35em");
        }

        if (autoHotLine) {
            data[0].values.length && setValueHotLine(
                data[0].values[data[0].values.length - 1]
                , data[1].values[data[1].values.length - 1]
            );
        }
        else {
            lastPos && setValueHotLine(lastPos.d, lastPos.d1);
        }
    }

    var bisectDate = d3.bisector(function(d) { return d.date; }).left
        , hotLine
        , hotLineCircle
        , hotLineCircleI
        , autoHotLine = true
        , lastPos
        ;

    div.on('mouseover', function() { autoHotLine = false; })
        .on('mouseout', function() { autoHotLine = true; })
        .on("mousemove", mousemove)
    ;

    function mousemove() {
        if (!data[0].values.length)
            return;

        var values = data[0].values
            , x0 = x.invert(d3.mouse(svg.node())[0])
            , i = bisectDate(values, x0, 1)
            , d0 = values[i - 1]
            , d1 = values[i]
            , d = x0 - d0.date > d1.date - x0 ? d1 : d0
            ;

        i -= d0 === d ? 1 : 0;
        d1 = data[1].values[i];
        setValueHotLine(d, d1);
    }

    function setValueHotLine(d, d1) {
        if (!d || !d.date)
            return;

        var tx = x(d.date);
        if(!tx)
            return;

        hotLine.attr("transform", "translate(" + tx + ", 0)");
        hotLineCircle.attr("transform", "translate(0, " + y(d.value) + ")");
        hotLineCircle.select("text").text(d.value);
        hotLineCircleI.attr("transform", "translate(0, " + yI(d1.value) + ")");
        hotLineCircleI.select("text").text(formatSum(d1.value));
        lastPos = {
            d : d,
            d1 : d1
        };
    }

    function clear() {
        data[0].values.splice(0);
        data[1].values.splice(0);
        update();
    }

    d3.select(window).on('resize.trend_layer', function() {
        width = (w || div.node().clientWidth) - margin.left - margin.right;
        x.range([0, width]);
        svg.attr("width", width + margin.left + margin.right)
        d3.select('#clip').attr("width", width - 2);
        update();
    });

    return {
        append : append
        , clear : clear
        , container : div
    };
}
