// Rounding function 
roundNumbers = (value, decimals) => {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

nFormatter = (num, digits) => {
	var si = [
	  { value: 1, symbol: "" },
	  { value: 1E3, symbol: "K" },
	  { value: 1E6, symbol: "M" },
	  { value: 1E9, symbol: "G" },
	  { value: 1E12, symbol: "T" },
	  { value: 1E15, symbol: "P" },
	  { value: 1E18, symbol: "E" }
	];
	var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	var i;
	for (i = si.length - 1; i > 0; i--) {
	  if (Math.abs(num) >= si[i].value) {
		break;
	  }
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

convertToDisplayCostFormat = (val) => {
	return roundNumbers(val, 0).toLocaleString();
}

convertToShortenCostFormat = (val) => {
	return nFormatter(roundNumbers(val, 0), 1);
}

convertToDisplayPercentFormat = (val) => {
	return roundNumbers(val * 100, 0).toLocaleString();
}

// Calculation Function
calculateResults = function() {
	const numbersDecmals = 10;
	// Get the slider values as an input
	let Input_Online_Protected_Capacity = $('.range-slider>input[type="text"]:eq(0)').slider().data('slider').getValue();
	let Input_Average_Throughput = $('.range-slider>input[type="text"]:eq(1)').slider().data('slider').getValue();
	let Input_Peak_Throughput = $('.range-slider>input[type="text"]:eq(2)').slider().data('slider').getValue();
	let Input_Days_Of_Online_Data_VTL = $('.range-slider>input[type="text"]:eq(3)').slider().data('slider').getValue();

	// Dependent variables (sub calculations)
	let TB_Per_Hour_Backed_Up 				= roundNumbers((1 - Peak_Throughput_Percentage) * Input_Average_Throughput 
												+ Peak_Throughput_Percentage * Input_Peak_Throughput, numbersDecmals);
	let Daily_TB_Required 					= TB_Per_Hour_Backed_Up * 24;
	let Total_Days_Modeled 					= 365 * Number_Of_Years
	let Total_TB_Backed_Up 					= Total_Days_Modeled * Daily_TB_Required
	let Capacity_Required_IBM_VTL 			= roundNumbers(Daily_TB_Required * Input_Days_Of_Online_Data_VTL 
												* (1-Compression_Savings - IBM_RTC_Additional_Savings), numbersDecmals);
	let Capacity_Required_Alt_VTL 			= roundNumbers(Daily_TB_Required * Input_Days_Of_Online_Data_VTL 
												* (1 - Compression_Savings), numbersDecmals);
	let Capacity_Required_Tape 				= roundNumbers(Total_TB_Backed_Up * (1 - Compression_Savings+Capacity_Overhead_Tape), 3);
	let MBPS_Required 						= Math.ceil(TB_Per_Hour_Backed_Up * MB_Per_TB / Seconds_Per_Hour)
	let Number_Tape_Drives_Performance 		= Math.ceil(MBPS_Required / Tape_Performance_Per_Drive 
												* (1 - Performance_Overhead_Tape)) * 2
	let Number_Tape_Cartridges_Capacity 	= roundNumbers(Capacity_Required_Tape / Tape_Capacity_Per_Cartdridge, numbersDecmals);
	let Tape_Deployed_Drives 				= Math.max(Tape_Assumed_Base_Number_Drives,Number_Tape_Drives_Performance)
	let Peak_Throughput_HW_Cost_Multipler 	= roundNumbers((Input_Peak_Throughput / 7) * 1, numbersDecmals);
	let Tape_Base_HW_Cost 					= Tape_Base_Cost_Per_Frame
	let Tape_Drive_Cost 					= Tape_Deployed_Drives * Tape_Cost_Per_Drive
	let Performance_Increments_IBM_VTL 		= Math.ceil(MBPS_Required / 100)

	//Outputs
	const Tape_Media_Cost 				= Number_Tape_Cartridges_Capacity * Tape_Cost_Per_Cartridge

	const Tape_HW_Cost 					= Tape_Base_HW_Cost + Tape_Drive_Cost * (1 - Tape_HW_Discount) 
											* (1 + Peak_Throughput_HW_Cost_Multipler)
	const IBM_VTL_HW_Cost 				= IBM_VTL_Base_HW_Cost + Capacity_Required_IBM_VTL * IBM_VTL_HW_Per_Additional_TB 
											* (1 - IBM_VTL_HW_Discount)
	const ALT_VTL_HW_Cost 				= Capacity_Required_Alt_VTL * ALT_VTL_HW_Cost_Per_TB * (1 - Alt_VTL_HW_Discount)

	const IBM_VTL_SW_Cost 				= Performance_Increments_IBM_VTL * IBM_Cost_Per_100MBPS * (1 - IBM_VTL_SW_Discount)
	const ALT_VTL_SW_Cost 				= Input_Online_Protected_Capacity * Alt_VTL_Software_Cost_Per_TB 
											* (1 - Alt_VTL_SW_Discount)
	const Tape_BU_SW_Cost 				= Input_Online_Protected_Capacity * Tape_BU_Software_Cost_Per_TB 
											* (1 - Alt_VTL_SW_Discount)

	const IBM_VTL_Maint_Total 			= Number_Of_Years * (IBM_VTL_HW_Cost * (1 - IBM_VTL_HW_Discount) 
											* IBM_VTL_HW_Maint_Percent + IBM_VTL_SW_Cost * IBM_VTL_SW_Maint_Percent)
	const Alt_VTL_Maint_Total 			= Number_Of_Years * (ALT_VTL_HW_Cost * (1 - Alt_VTL_HW_Discount) 
											* ALT_VTL_HW_Maint_Percent + ALT_VTL_SW_Cost * ALT_VTL_SW_Maint_Percent)
	const Tape_Maint_Total 				= Number_Of_Years * (Tape_HW_Cost * (1 - Tape_HW_Discount) * Tape_Maint_Percent 
											+ Tape_BU_SW_Cost * Tape_SW_Maint_Percent + Tape_Offsite_Storage_Per_Year)

	const IBM_VTL_Infrastructure_Total 	= IBM_VTL_HW_Cost * (1 - IBM_VTL_HW_Discount) 
											* IBM_VTL_Infrastructure_Percent_Of_Hardware * Number_Of_Years
	const Alt_VTL_Infrastructure_Total 	= ALT_VTL_HW_Cost * (1 - Alt_VTL_HW_Discount) 
											* Alt_VTL_Infrastructure_Percent_Of_Hardware * Number_Of_Years
	const Tape_Infrastructure_Total 	= Tape_HW_Cost * (1 - Tape_HW_Discount) 
											* Tape_Infrastructure_Percent_Of_Hardware * Number_Of_Years

	const IBM_VTL_Staff_Total 			= IBM_VTL_Staff_Percent_Of_IBM_HW * IBM_VTL_HW_Cost 
											* (1 - IBM_VTL_HW_Discount) * Number_Of_Years
	const Alt_VTL_Staff_Total 			= Alt_VTL_Staff_Percent_Of_IBM_HW * IBM_VTL_HW_Cost 
											* (1 - IBM_VTL_HW_Discount) * Number_Of_Years
	const Tape_Staff_Total 				= Tape_Staff_Percent_Of_HW_Media * (Tape_Media_Cost + Tape_HW_Cost) 
											* (1 - Tape_HW_Discount) * Number_Of_Years

	const Tape_TCO 						= Tape_HW_Cost + Tape_Media_Cost + Tape_BU_SW_Cost 
											+ Tape_Infrastructure_Total + Tape_Staff_Total + Tape_Maint_Total
	const Alt_VTL_TCO 					= ALT_VTL_HW_Cost + ALT_VTL_SW_Cost + Alt_VTL_Maint_Total 
											+ Alt_VTL_Infrastructure_Total + Alt_VTL_Staff_Total
	const IBM_VTL_TCO 					= IBM_VTL_HW_Cost + IBM_VTL_SW_Cost + IBM_VTL_Maint_Total 
											+ IBM_VTL_Infrastructure_Total + IBM_VTL_Staff_Total
	const Savings_vs_Tape 				= Tape_TCO - IBM_VTL_TCO
	const Savings_vs_Alt_VTL 			= Alt_VTL_TCO - IBM_VTL_TCO
	const TCO_Reduction_vs_Tape 		= (Tape_TCO - IBM_VTL_TCO) / Tape_TCO
	const TCO_Reduction_vs_Alt_VTL 		= (Alt_VTL_TCO - IBM_VTL_TCO) / Alt_VTL_TCO

	//Display the results to interface
	
	$("#saving-tape-value").text(convertToShortenCostFormat(Savings_vs_Tape));
	$("#saving-tape-value").attr("data-original-title", convertToDisplayCostFormat(Savings_vs_Tape))

	$("#saving-alt-vtl-value").text(convertToShortenCostFormat(Savings_vs_Alt_VTL));
	$("#saving-alt-vtl-value").attr("data-original-title", convertToDisplayCostFormat(Savings_vs_Alt_VTL))

	$("#tco-tape-value").text(convertToDisplayPercentFormat(TCO_Reduction_vs_Tape));
	$("#tco-alt-vtl-value").text(convertToDisplayPercentFormat(TCO_Reduction_vs_Alt_VTL));

	
	
	// Redraw the graph

	stackedBarData = [{
						stack: "Hardware",
						name: "HardwareCostTape",
						value: Tape_HW_Cost,
						company: "Tape"
					},
					{
						stack: "Hardware",
						name: "HardwareCostALT",
						value: ALT_VTL_HW_Cost,
						company: "Alt. VTL"
					},
					{
						stack: "Hardware",
						name: "HardwareCostIBM",
						value: IBM_VTL_HW_Cost,
						company: "IBM"
					},
					{
						stack: "Media",
						name: "MediaCostATL",
						value: Tape_Media_Cost,
						company: "Tape"
					},
					{
						stack: "Software",
						name: "Software Cost",
						value: Tape_BU_SW_Cost,
						company: "Tape"
					},
					{
						stack: "Software",
						name: "Software Cost",
						value: ALT_VTL_SW_Cost,
						company: "Alt. VTL"
					},
					{
						stack: "Software",
						name: "Software Cost",
						value: IBM_VTL_SW_Cost,
						company: "IBM"
					},
					{
						stack: "Maintenance",
						name: "Maintenance and Support Cost",
						value: Tape_Maint_Total,
						company: "Tape"
					},
					{
						stack: "Maintenance",
						name: "Maintenance and Support Cost",
						value: Alt_VTL_Maint_Total,
						company: "Alt. VTL"
					},
					{
						stack: "Maintenance",
						name: "Maintenance and Support Cost",
						value: IBM_VTL_Maint_Total,
						company: "IBM"
					},
					{
						stack: "infrastructure",
						name: "Infrastructure Cost",
						company: "Tape",
						value: Tape_Infrastructure_Total
					},
					{
						stack: "infrastructure",
						name: "Infrastructure Cost",
						value: Alt_VTL_Infrastructure_Total,
						company: "Alt. VTL"
					},
					{
						stack: "infrastructure",
						name: "Infrastructure Cost",
						value: IBM_VTL_Infrastructure_Total,
						company: "IBM"
					},
					{
						stack: "Staff",
						name: "Staff and Professional Services Cost",
						value: Tape_Staff_Total,
						company: "Tape"
					},
					{
						stack: "Staff",
						name: "Staff and Professional Services Cost",
						value: Alt_VTL_Staff_Total,
						company: "Alt. VTL"
					},
					{
						stack: "Staff",
						name: "Staff and Professional Services Cost",
						value: IBM_VTL_Staff_Total,
						company: "IBM"
					}
				];

	drawStackedChart()

	// Redraw the graph
};