/**
 * Created by artzub on 4.08.2014.
 */

L.control.UniqIdRangeControl = 0;

L.Control.RangeControl = L.Control.extend({
    options : {
        position : 'topleft',
        strings : {
            label : "",
            title : ""
        },
        max : 10,
        min : 0,
        step : 1,
        value : 0,
        showValue : true,
        action : {
            onChange : null,
            onGetValueText : null
        }
    },

    onAdd : function(map) {
        L.control.UniqIdRageControl = L.control.UniqIdRageControl || 0;
        var id = '__range__' + (L.control.UniqIdRageControl++);

        var bar = L.DomUtil.create('div', 'leaflet-control-rageconsole leaflet-bar leaflet-control');

        var label = L.DomUtil.create('label', 'leaflet-bar-part', bar);

        L.DomEvent
            .on(label, 'click', L.DomEvent.stopPropagation)
            .on(label, 'click', L.DomEvent.preventDefault)
            .on(label, 'dbclick', L.DomEvent.stopPropagation)
        ;

        label = d3.select(label);
        label.html(this.options.strings.label);
        label.attr("for", id)
            .attr("title", this.options.strings.title);

        var range = L.DomUtil.create('input', 'leaflet-bar-part', bar);
        L.DomEvent
            .on(range, 'click', L.DomEvent.stopPropagation)
            .on(range, 'click', L.DomEvent.preventDefault)
            .on(range, 'mousemove', L.DomEvent.stopPropagation)
        ;

        range = d3.select(range)
            .attr('title', this.options.strings.title)
            .attr('id', id)
            .attr('type', "range")
            .attr("max", this.options.max)
            .attr("min", this.options.min)
            .attr("step", this.options.step)
        ;

        label = L.DomUtil.create('label', 'leaflet-bar-part', bar);

        L.DomEvent
            .on(label, 'click', L.DomEvent.stopPropagation)
            .on(label, 'click', L.DomEvent.preventDefault)
            .on(label, 'dbclick', L.DomEvent.stopPropagation)
        ;

        label = d3.select(label).attr('title', this.options.strings.title);

        var options = this.options;
        var action = options.action;

        function change() {
            typeof action.onChange === "function"
            && action.onChange.apply(this, arguments);

            label.style('display', options.showValue ? "null" : "none");
            label.html(function(value) {
                return typeof action.onGetValueText === "function"
                    ? action.onGetValueText(value)
                    : value;
            }(this.value))
        }

        range.on('change', change);

        range.node().value = this.options.value;

        (change.bind(range.node()))();

        this.bar = d3.select(bar);
        this.bar.hide = function() {
            this.style('display', 'none');
        };
        this.bar.show = function() {
            this.style('display', null);
        };

        return bar;
    }
});

L.control.rangeControl = function (options) {
    return new L.Control.RangeControl(options);
};
