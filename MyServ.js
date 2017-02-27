function MyServ(socket,roomList){
    this.roomList = roomList;
    this.socket = socket;
    this.startTime= new Date().getTime()
    this.heartBeatCount = 0;
    this.isAdmin;
    this.user;
    this.init=() =>{
        this.emitHeartBeat();
        this.waitForGameStart();
        this.roomLogic();
    };

        this.roomLogic= () => {
            var that = this;
            this.socket.on('join', function (roomID,user,isAdmin) {
                that.user = user;
                that.roomID = roomID;
                that.isAdmin = isAdmin;
     
                if (!that.roomList[roomID]) {
                    that.roomList[roomID] = {info:{
                        roomID:roomID,
                        gameStartTime:''
                    },adminSocket:'',user:[]};
                }

                if(isAdmin){
                    that.roomList[roomID].adminSocket = that.socket;
                }
                
                that.roomList[roomID].user.push(user);


                that.socket.join(roomID); 
            
                if(that.roomList[roomID].adminSocket){
                    var adminSocket = that.roomList[roomID].adminSocket
                    adminSocket.emit('studentJoinRoom', user  ,that.roomList[roomID].user); 
                }
                that.socket.emit('gameInfo', that.roomList[roomID]['info']); 

                console.log(user + ' join ' + roomID);
            });


 
            this.socket.on('getRoomInfo', function () {
                var room = that.roomList[that.roomID];
              
                room.adminSocket.emit('RoomInfo', {
                    user:room.user,
                    info:room.info
                });
            });

            this.socket.on('leave', function () {
                that.socket.emit('disconnect');
            });

            this.socket.on('disconnect', function () {
                if(!that.roomID){
                    return false;
                }
                var room = that.roomList[that.roomID];
                var index = room.user.indexOf(that.user);
                if (index !== -1) {
                    room.user.splice(index, 1);
                }

                that.socket.leave(that.roomID);
                if(room.adminSocket){
                    room.adminSocket.emit('adminMsg', that.user + ' Quit',that.roomID);
                }
                console.log(that.user + '退出了' + that.roomID);
            });
        }

    this.emitHeartBeat= () => {
            
             setInterval(function(){
                 var timeStamp = new Date().getTime();
                 var duration =  timeStamp -this.startTime;
                 
                 this.socket.emit('HeartBeat', {
                     timeStamp:timeStamp,
                      duration : duration,
                      heartBeatCount : this.heartBeatCount++
                });
                 }.bind(this), 1000);
    }

    this.waitForGameStart=()=>{
        var that = this;
        this.socket.on('gameStart', function () {
            var room = that.roomList[that.roomID];
            var gameStartTime = new Date().getTime();
            room.info.gameStartTime = gameStartTime;
            that.socket.to(that.roomID).emit('gameStart', 
                {
                    gameStartTime:gameStartTime
                    }); 
 
           }); 
    }


}

module.exports = MyServ;

  
