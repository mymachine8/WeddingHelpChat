/**
 * Created by kkommanapall on 10/22/2015.
 */
var CareService = require('../models/careservice');
var Customer = require('../models/customer');
var Message = require('../models/message');
var ServiceExecutive = require('../models/serviceexecutive');
function MessageService(){
    this.connectedCustomers = []; //Customers who are already connected, contains customerIds
    this.pendingCustomers = {}; //PendingCustomer list which contains customerId and list of his messages
    this.executives = {};
    this.customers = {}; //Contains list of all customers who have open socket
    this.allSockets = {};
    this.executiveSockets = {};
    this.customerSockets = {};
};

MessageService.prototype.registerExecutive = function(id, name, services, socket){
    var executive = new ServiceExecutive(id, name, services);
    this.executives[id] = executive;
    this.executiveSockets[id] = socket;
    this.allSockets[id] = socket;
};

MessageService.prototype.pickExecutive = function(customer){
    for(var id in this.executiveSockets){
         for(var index=0;index < this.executives[id].services.length; index++){
             if(customer.serviceRequestId == this.executives[id].services[index]) {
                 return id;
             }
         }
    }
    return null;
};

MessageService.prototype.messagesExecCanServe = function(executiveId) {
    var messages = [];
    for(var customerId in this.pendingCustomers){
        for(var index=0; index < this.executives[executiveId].services.length; index++) {
            if(this.customers[customerId].serviceRequestId == this.executives[executiveId].services[index]){
                for(var mIndex = 0; mIndex < this.pendingCustomers[customerId].messages.length; mIndex++)
                    this.pendingCustomers[customerId].messages[mIndex].receiverId = executiveId;
                messages = this.pendingCustomers[customerId].messages;
                delete this.pendingCustomers[customerId];
                return messages;
            }
        }
    }
    return messages;
};

MessageService.prototype.connectMessageWithExecutive = function(senderId,serviceId,content){
    var customer = this.customers[senderId];
    var executiveId = this.pickExecutive(customer);
    if(executiveId !== null){
        return this.createMessage(senderId,executiveId, serviceId,content);
    }
    this.storePendingMessages(senderId, this.createMessage(senderId,null,serviceId,content));
    return null;
};

MessageService.prototype.storePendingMessages = function(id, message) {
    if(this.pendingCustomers[id] === undefined || this.pendingCustomers[id] === null)
        this.pendingCustomers[id]= {};
    var pendingMessages = this.pendingCustomers[id].messages;
    if (pendingMessages === undefined || pendingMessages === 0) {
        pendingMessages = [];
        pendingMessages.push(message);
    }
    else {
        pendingMessages.push(message);
    }
    this.pendingCustomers[id].messages = pendingMessages;
};

MessageService.prototype.registerCustomer = function(id,name,serviceRequestId,socket) {
    var customer = new Customer(id,name,serviceRequestId);
    this.customers[id] = customer;
    this.customerSockets[id] = socket;
    this.allSockets[id] = socket;
};

MessageService.prototype.hasReceiver = function(receiverId){
    if(receiverId ===null || receiverId === undefined || receiverId <=0){
        return false;
    }
    return true;
};

MessageService.prototype.createMessage = function(senderId,receiverId,serviceId,content){
    return new Message(senderId, receiverId,serviceId, content);
};


module.exports = MessageService;
