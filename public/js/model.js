/**
 * Created by kkommanapall on 10/23/2015.
 */
function Message(senderId,receiverId,serviceId, content){
    this.id = Date.now();
    this.content = content;
    this.receiverId = receiverId;
    this.senderId = senderId;
    this.serviceId = serviceId;
};

function ServiceExecutive(id, name,services){
    this.id = id;
    this.name = name;
    this.services = services;
};