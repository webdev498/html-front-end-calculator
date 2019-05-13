let stackedBarData;
let stackedBarChart = new britecharts.stackedBar();
let chartTooltip = new britecharts.tooltip();

const drawStackedChart = () => {
    var graphContainer = d3.select('.js-stacked-bar-chart-tooltip-container'),
        containerWidth = graphContainer.node() ? graphContainer.node().getBoundingClientRect().width : false,
        containerHeight = 400,
        margin = {
            left: 100,
            right: 20,
            top: 20,
            bottom: 30
        },
        tooltipContainer;

    stackedBarChart
        .tooltipThreshold(450)
        .width(containerWidth)
        .height(containerHeight)
        .margin(margin)
        .grid('horizontal')
        .betweenBarsPadding(0.4)
        .isAnimated(true)
        .stackLabel('stack')
        .nameLabel('company')
        .valueLabel('value')
        .on('customMouseOver', chartTooltip.show)
        .on('customMouseMove', function(dataPoint, topicColorMap, x, y) {
            chartTooltip.update(dataPoint, topicColorMap, x, y);
        })
        .on('customMouseOut', chartTooltip.hide);

    graphContainer.datum(stackedBarData).call(stackedBarChart);

    chartTooltip
        .shouldShowDateInTitle(false)
        .topicLabel('values')
        .nameLabel('stack')
        .title('Overview');

    tooltipContainer = d3.select('.js-stacked-bar-chart-tooltip-container .metadata-group');
    tooltipContainer.datum([]).call(chartTooltip);

}


/*------------- Responsive Handling -------*/

const redrawCharts = () => {
    graphContainer = d3.select('.js-stacked-bar-chart-tooltip-container');
    let newContainerWidth = graphContainer.node() ? graphContainer.node().getBoundingClientRect().width : false;
     
    // Setting the new width on the chart
    stackedBarChart
        .width(newContainerWidth)
        // .tooltipThreshold(newContainerWidth);
 
    // Rendering the chart again
    graphContainer.datum(stackedBarData).call(stackedBarChart);
};

window.addEventListener("resize", redrawCharts);