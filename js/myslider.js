//Initialize the sliders
$('.range-slider>input[type="text"]').slider();

// Attach the Change event on Sliders
$('.range-slider>input[type="text"]').each(function(){
    // Attach the change event
    $(this).slider().on("change", function(slideEvt) {
        sliderValue = slideEvt.value.newValue;
        $(this).siblings(".plusminus").find("span[name='valuePicker']").text(sliderValue)

        // Update the calculation results
        calculateResults();
    });
})