/**
 * Created by kkommanapall on 10/22/2015.
 */
function Message(senderId,receiverId,serviceId, content){
    this.id = Date.now();
    this.content = content;
    this.receiverId = receiverId;
    this.senderId = senderId;
    this.serviceId = serviceId;
}

module.exports = Message;