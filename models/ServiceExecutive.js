/**
 * Created by kkommanapall on 10/22/2015.
 */
function ServiceExecutive(id, name,services){
    this.id = id;
    this.name = name;
    this.services = services;
    this.activeServiceCount = 0;
}

module.exports = ServiceExecutive;
