var input = $('.number-pickup input'),
    input_val = parseInt(input.val()),
    btn_add = $('.number-pickup .add'),
    btn_remove = $('.number-pickup .remove'),
    min = parseInt(input.attr('min'), 10),
    max = parseInt(input.attr('max'), 10);

input.keyup(function()  {
    input_val = parseInt(input.val())
});

setValue = function(val) {
    console.log("asdfasdf", val);
    if ((val <= min) || (!val)) {
        input.val(min);
    } else if (val >= max) {
        input.val(max);
    } else {
        input.val(val);
    }
}

btn_add.click(function(e) {
    if (e.shiftKey) {
        input_val += 10
    } else {
        input_val++
    }
    setValue(input_val)
});

btn_remove.click(function(e) {
    if (input_val > 11 && e.shiftKey) {
        input_val -= 10
    } else if (input_val > 1) {
        input_val--
    }
    setValue(input_val)
});
