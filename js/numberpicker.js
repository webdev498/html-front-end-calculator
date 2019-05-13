var updateValueSlider = function($current) {
    currentValue = $current.text();
    $currentSlider = $current.closest(".range-slider").find("input").slider().data('slider');
    $currentSlider.setValue(currentValue);

    calculateResults();
};


(function ($) {
    $.fn.numberPicker = function () {
        var dis = 'disabled';
        return this.each(function () {
            var picker = $(this),
                slider = picker.siblings("input[type='text']"),
                p = picker.find('button:first-child'),
                m = picker.find('button:last-child'),
                input = picker.find('span.value-number'),
                min = parseFloat(slider.attr('data-slider-min')),
                max = parseFloat(slider.attr('data-slider-max')),
                step = parseFloat(picker.attr('data-number-step')),
                round = function(value, decimals) {
                    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
                },
                inputFunc = function (picker) {
                    var i = parseFloat(input.text(), 10);
                    if ((i <= min) || (!i)) {
                        input.text(min);
                        // p.prop(dis, false);
                        // m.prop(dis, true);
                    } else if (i >= max) {
                        input.text(max);
                        // p.prop(dis, true);
                        // m.prop(dis, false);
                    } else {
                        // p.prop(dis, false);
                        // m.prop(dis, false);
                    }

                    //Update the slider
                    updateValueSlider(input);
                },
                changeFunc = function (picker, qty) {
                    var q = qty,
                        i = parseFloat(input.text());
                    if ((i < max && (q > 0)) || (i > min && !(q > 0))) {
                        input.text(round((i + q), 10));
                        inputFunc(picker);
                    }
                };
            m.on('click', function () {
                changeFunc(picker, - step);
            });
            p.on('click', function () {
                changeFunc(picker, step);
            });
            input.on('change', function () {
                inputFunc(picker);
            });
            // inputFunc(picker); //init
        });
    };
}(jQuery));

$('.plusminus').numberPicker();

