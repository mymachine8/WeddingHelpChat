/**
 * Created by kkommanapall on 10/22/2015.
 */

var convertToObject = function(data){
    if(Object.prototype.toString.call(data) === "[object String]")
        data = JSON.parse(data);
    return data;
}

var helper = {
    convertToObject : convertToObject
};

module.exports = convertToObject(helper)
