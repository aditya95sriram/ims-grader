/* Main documented script, cannot be used as a bookmarklet. Look at ims_grader.min.js for a minified version to be used as a bookmarklet. */ 

function sep() {console.log("");} // separator for console output

/* Obsolete function, retained for explanatory purposes */
function check(a, b, c) { // checks if any two of a,b or c is true
    return ( (a||b) && (b||c) && (a||c) );
}

/* individual row scraper, gather all information about a course and return as object */
function indi(t) {
    t = $(t);
    obj = {};
    tds = t.find("td");
    obj.sem = tds.eq(0).text().trim();
    obj.code = tds.eq(1).text().trim();
    obj.course = tds.eq(2).text().trim();
    obj.credits = parseInt(tds.eq(3).text().trim(), 10);
    obj.grade = tds.eq(4).find('input').val();
    return obj;
}

/* main process, computes individual spi and final cpi */
function process() {
    var sems = {}, msg="";
    var carry_cpi = parseFloat(prompt("Unrecorded CPI (Optional)")) || 0;
    var grand_total_credits = parseInt(prompt("Unrecorded Total credits (Optional)")) || 0,
        grand_total_points = parseInt(prompt("Unrecorded Credit Points You Earned (Optional)")) || 0;
    
    // aliases for convenience in verification of "unrecorded" quantities
    var a = carry_cpi, b = grand_total_points, c = grand_total_credits;    
    if (a||b||c) { // at least one of the values provided
        // check if all "unrecorded" quantities can be computed from provided set
        if ( (a||b) && (b||c) && (a||c) ) {
            // set all values, depending on the possibly incomplete set provided
            grand_total_points = grand_total_points || Math.round(carry_cpi*grand_total_credits);
            carry_cpi = carry_cpi || (grand_total_points/grand_total_credits);
            grand_total_credits = grand_total_credits || Math.round(grand_total_points/carry_cpi);       
        } else {
            // only one of the "unrecorded" quantity given, not possible to carry on
            alert("Insufficient data. Couldn't calculate CPI."); 
            return;
        }
    }
    
    msg = "\nUnrecorded Credit Points you earned: " + grand_total_points + "\nUnrecorded Total Credits: " + grand_total_credits + "\nUnrecorded CPI: " + carry_cpi.toFixed(2);
    
    // grade to score mapping
    map = {"A+": 11,"A": 10,"A-": 9,"B": 8,"B-": 7,"C": 6,"C-": 5,"D": 4,"F": 0};
    
    // for each course, do...
    $(".st_grid_row").each(function() {
        obj = indi(this);
        if (!(obj.sem in sems)) { // if new semester encountered
            sep(); // add separator to console output
            // create new entry for this semester
            sems[obj.sem] = { total_credits: 0,
                              total_points: 0 };
        }
        if (map[obj.grade]) { // if grade is valid or worth considering (ignores "P" grade)
            console.log(obj.sem + ": Considering", obj.code, "("+obj.course+")");
            sems[obj.sem].total_credits += obj.credits;
            sems[obj.sem].total_points += obj.credits * map[obj.grade];
        } else {
             console.log(obj.sem + ": Not considering", obj.code, "("+obj.course+")");
        }
    });
    sep();
    for (var t in sems) {
        tp = sems[t].total_points;  // total points this semester
        tc = sems[t].total_credits; // total credits this semester
        grand_total_credits += tc;  
        grand_total_points += tp;
        spi = (tp / tc).toFixed(2);
        msg = "SPI for " + t + " : " + spi + " \n" + msg;
        console.log("SPI for ", t, ":", spi);
    }
    sep();
    final_cpi = (grand_total_points / grand_total_credits).toFixed(2)
    msg = "<b>CPI: " + final_cpi + "</b>\n\n" + msg;
    console.log("Final CPI: " + final_cpi);
    //alert(msg);
    $('div.span11 input').val(final_cpi);  // update "CPI" input box value
    // styling the cpi input box
    $('div.span12:last,div.span12:last input').css({"line-height":"18pt","font-size":"18pt",height:"32px","font-weight":"bold"});
    $('div.span12:last').css({"margin-top":"-10px"});
    // insert summary message
    $('.widget-title').after('<hr/><p style="padding-left:10px;">'+msg.replace(/\n/g,"<br/>")+'</p>');
}

function reset() {
    $('.st_grid_row td:nth-child(5) input').val(function() {return $(this).data().default;});
}

/* get page ready by inserting "Calculate CPI" button, and converting "grade" labels into edittable inputs */
function init() {  
    // insert "Calculate CPI" button
    $('.widget-title').after('<hr/><p style="text-align:center;margin-bottom:0;"><button onclick="process();" type="button" style="font-size:16pt;">Calculate CPI</button><button onclick="reset();" type="button" style="font-size:16pt;">Reset grades</button></p><hr/>');
    // convert labels into edittable inputs
    $('.st_grid_row td:nth-child(5)').replaceWith(function() {
        var t = $(this).text().trim();
        return '<td><input data-default="'+ t +'" value="' + t + '"></input></td>'});
}

init();
