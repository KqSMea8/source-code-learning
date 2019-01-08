BK.Script.loadlib('GameRes://qqPlayCore.js');

//用于表示用户标识
var openId = GameStatusInfo.openId;
//游戏标识
var gameId = GameStatusInfo.gameId;
//是否房主
var isMaster = GameStatusInfo.isMaster ==1 ? true :false

// iPhone 6 (750x1334) 的分辨率为标准进行缩放。
DESIGN_WIDTH  = 750
DESIGN_HEIGHT = 1334
var scale = BK.Director.screenPixelSize.width / DESIGN_WIDTH;
BK.Director.root.scale = {x:scale,y:scale};

function initUI()
{
    //隐藏按钮
    var hideBtn = new BK.Button(100,100,"GameRes://res/hide.png",function () {
                            BK.Script.log(0,0,"hide click!");
                            BK.QQ.notifyHideGame();
                        });
    hideBtn.position = {x:10,y:DESIGN_HEIGHT-100-10}

    //关闭按钮
    var closeBtn = new BK.Button(100,100,"GameRes://res/close.png",function () {
                            BK.Script.log(0,0,"close click!");
                            BK.QQ.notifyCloseGame();
                        });
    closeBtn.position = {x:DESIGN_WIDTH-100-10,y:DESIGN_HEIGHT-100-10}

   
    //背景
    var backTex  =new BK.Texture('GameRes://res/night.png');
    var background =new BK.Sprite(DESIGN_WIDTH,DESIGN_HEIGHT,backTex,0,1,1,1);
     
    background.canUserInteract = true;
    BK.Director.root.addChild(background);
    background.addChild(hideBtn);
    background.addChild(closeBtn);
}



//广播通知给所有在线用户。广播的消息不保存。
function sendBroadcastData(game) {
    //用户定义的字段

    var req = '{"s":"12345678901234567890AB","m":"map","d":"2"}';
    
    BK.Script.log(0,0,"sendBroadcastData :"+ req.length);
    var data = new BK.Buffer(req.length);
    data.writeStringBuffer(req);
    var str = data.readStringBuffer();
    if(str){
        BK.Script.log(0,0,"sendBroadcastData str:"+ str);
    }else{
        if(!data){
            BK.Script.log(0,0,"sendBroadcastData data is undefined");
        }
        BK.Script.log(0,0,"sendBroadcastData str is undefined :"+ str);
    }
    game.sendBroadcastData(data);
}

function broadcastCallback(fromId,buff)
{
     var data = buff.readStringBuffer()
     BK.Script.log(0,0,"broadcastCallback :"+ buff.bufferLength());
     BK.Script.log(0,0,"broadcastCallback str:"+ data);
}

//发送帧同步事件
function sendSyncOpt(game,userDefineCmd)
{
    //预留字段，暂时填0
    var status = new BK.Buffer(1,1);
    status.writeUint8Buffer(0);

    //用户定义的字段
    var str = "ABC";
    //往buffer中写入string时，需多申请3个字节大小
    var opt = new BK.Buffer(str.length+3,1);
    opt.writeStringBuffer(str);

    BK.Script.log(1,1,"sync !!!!!send frame  1");
    //预留字段
    var extend = new BK.Buffer(1,1);
    extend.writeUint8Buffer(0);
    
    //send 
    game.syncOpt(status,opt,extend,undefined,function(){
        BK.Script.log(1,1,"sync !!!!!recv ack= "+game.ackSeq);
    });
}

function frameSyncCallback(frameDataArray){
    BK.Script.log(0,0,"收到帧同步数据");

    var frameCount = frameDataArray.length;
    for (var index = 0; index < frameDataArray.length; index++) {

        var players  =frameDataArray[index];
        BK.Script.log(0,0,"帧同步序列 = " +players.frameSeq);

        BK.Script.log(1,1,"players count :" + players.length);      
        if(players){
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                BK.Script.log(0,0,"sync !!!!!!!!!!!! openid :"+player.openId);
                BK.Script.log(0,0,"sync !!!!!!!!!!!! itemId :"+player.itemId);
                var cmd = player.dataBuffer.readStringBuffer();
                BK.Script.log(1,1,"sync !!!!!!!!!!!! cmd len="+player.dataBuffer.bufferLength());
                BK.Script.log(1,1,"sync !!!!!!!!!!!! cmd="+cmd);
            }
        }
    }
}

function sendFrameSyncCmd(game,cmd)
{
    //用户定义的字段
    var opt = new BK.Buffer(1,1);
    opt.writeUint8Buffer(cmd);

    BK.Script.log(1,1,"sync !!!!!send frame  1");

    var status = new BK.Buffer(1,1);
    status.writeUint8Buffer(0);

    //预留字段
    var extend = new BK.Buffer(1,1);
    extend.writeUint8Buffer(0);
        
    //send 
    game.syncOpt(status,opt,extend,undefined,function(){
        BK.Script.log(1,1,"sync !!!!!recv ack= "+game.ackSeq);
    });
}

function sendItemFrameSync(game,openId,itemId){

    BK.Script.log(1,1,"sendItemFrameSync 1");

    var status = new BK.Buffer(1,1);
    status.writeUint8Buffer(0);

	//预留字段
    var extend = new BK.Buffer(1,1);
    extend.writeUint8Buffer(0);
		
     //用户定义的字段
    var opt = new BK.Buffer(1,1);
    opt.writeUint8Buffer(0);

    var itemListBuf = new BK.Buffer(32+1+8,1);
    //写入连续32个字节的字符串，此处不可直接使用writeStringBuffer。因会在写入的字符串中前后添加string的长度
    for(var i = 0 ; i < 32 ; i++ ){
        var ascii = openId.charCodeAt(i);
        itemListBuf.writeUint8Buffer(ascii);
    }

    itemListBuf.writeUint8Buffer(1);
    itemListBuf.writeUint64Buffer(itemId);

    game.syncOpt(status,opt,extend,itemListBuf,function(){
        BK.Script.log(1,1,"sendItemFrameSync sync !!!!!recv ack= "+game.ackSeq);
    });
}

function startGame(game)
{
     game.startGame(function (statusCode){
        BK.Script.log(0,0,"开始游戏！！"+statusCode);
        //发送一次带道具消耗的帧同步消息 PS:道具ID必须为正常，否则后台会返回1009系统异常
        // sendItemFrameSync(game,masterOpenId,1237788);
        //发送不带道具的帧同步消息
        sendFrameSyncCmd(game,123);
        
        //发送心跳包 
        //PS: 服务器在30s内如无收到 帧同步，广播，心跳包之一的上行包，则判定为离开。因此需确保30s内有上述三者之一的上行包
        //game.sendKeepAlive();
    }) ;
}

function addStartBtn(game)
{
  //确定按钮
    var normal = 'GameRes://res/start_normal.png'
    var btn = new BK.Button(250,100,normal,function () {
                            BK.Script.log(0,0,"button click!");
                            startGame(game);
                        });
    btn.setPressTexturePath('GameRes://res/start_pressed.png');

    btn.position = {x:DESIGN_WIDTH/2,y:DESIGN_HEIGHT/2};
    btn.anchor ={x:0.5, y:0.5}
    BK.Director.root.addChild(btn);
}


function masterCreateRoom(masterOpenId) {
    // 房主创建房间流程
    var game = new BK.Room();
    // 手Q环境，正式上线时使用 NETWORK_ENVIRONMENT_QQ_RELEASE 或 0 或不设置
    // 手Q环境，调试时使用 NETWORK_ENVIRONMENT_QQ_DEBUG  或 1
    // 开发环境,使用demo工程开发时使用 NETWORK_ENVIRONMENT_DEMO_DEV 或2
    game.environment = NETWORK_ENVIRONMENT_QQ_DEBUG;
    //添加到ticker中进行定时刷新
    BK.Director.ticker.add(function(ts,duration){
        game.updateSocket();
    });

    game.setLeaveRoomCallback(function(statusCode,leaveInfo)
    {
        if(leaveInfo){
            BK.Script.log(1,1,"leaveRoom reason:"+leaveInfo.reason);
            BK.Script.log(1,1,"leaveRoom logOutId:"+leaveInfo.logOutId);
        }
    });

    //普通创建房间
    game.createAndJoinRoom(gameId,masterOpenId,function (statusCode,room) {
        if(statusCode == 0){
            BK.Script.log(0,0,"玩家加入房间成功");

            BK.Script.log(0,0,"当前玩家：");
            room.currentPlayers.forEach(function(player) {
                BK.Script.log(1,1,"recvJoinRoom openId:"+player["openId"] );
                BK.Script.log(1,1,"recvJoinRoom joinTs:"+player["joinTs"] );
                BK.Script.log(1,1,"recvJoinRoom status:"+player["status"] );
            }, this);
            
            if(room.currentPlayers.length == 1 ){
                var player = room.currentPlayers[0];
                if(player["openId"] == masterOpenId){
                    BK.Script.log(0,0,"房主加入房间成功");
                    BK.QQ.notifyGameTipsWaiting();
                }
            }else{
                BK.Script.log(0,0,"房主加入房间 "+room.currentPlayers.length );
            }

            //设置广播回调监听
            game.setBroadcastDataCallBack(broadcastCallback);
            //发送广播事件
            sendBroadcastData(game);
            
            //设置云端存储玩家数据
            var dataInfo = "this is a message";
            var testUin8 = 1;
            var userDataBuf = new BK.Buffer(dataInfo.length+3+1,1); //当使用Buffer进行网络通信时，需多申请3个字节长度
            userDataBuf.writeStringBuffer(dataInfo);
            userDataBuf.writeUint8Buffer(testUin8);
            game.setUserData(userDataBuf,function(retCode){
                BK.Script.log(1,1,"设置云端存储 返回 = "+retCode );

                //获取云端存储数据
                game.getUserData(room.roomId,function (retCode,buf) {
                var dataInfo = buf.readStringBuffer();
                var testUin8 = buf.readInt8Buffer();
                //云端数据
                    BK.Script.log(1,1,"获取云端存储 dataInfo = "+dataInfo+" testUin8="+testUin8);
                });
            });
        
            //监听帧同步
            game.setFrameSyncListener( function (frameDataArray){
                var seq = game.lastFrame;
                BK.Script.log(0,0,"收到帧同步数据 seq = "+seq);

                var frameCount = frameDataArray.length;
                for (var index = 0; index < frameDataArray.length; index++) {
                    var players  =frameDataArray[index];
                    BK.Script.log(1,1,"players count :" + players.length);      
                    if(players){
                        for (var i = 0; i < players.length; i++) {
                            var player = players[i];
                            BK.Script.log(0,0,"sync !!!!!!!!!!!! openid :"+player.openId);
                            BK.Script.log(0,0,"sync !!!!!!!!!!!! itemId :"+player.itemId);
                            var cmd = player.dataBuffer.readStringBuffer();
                            BK.Script.log(1,1,"sync !!!!!!!!!!!! cmd len="+player.dataBuffer.bufferLength());
                            BK.Script.log(1,1,"sync !!!!!!!!!!!! cmd="+cmd);
                        }
                    }
                }
            });
        
           addStartBtn(game);

        }else{
            BK.Script.log(0,0,"创建房间失败 错误码："+ statusCode);
        }
    })
    return game;
}

function joinJoinRoom(roomId,joinerOpenId)
{
    // 参加者加入房间流程
    var game2 = new BK.Room();

    // 手Q环境，正式上线时使用 NETWORK_ENVIRONMENT_QQ_RELEASE 或 0 或不设置
    // 手Q环境，调试时使用 NETWORK_ENVIRONMENT_QQ_DEBUG  或 1
    // 开发环境,使用demo工程开发时使用 NETWORK_ENVIRONMENT_DEMO_DEV 或2
    game2.environment = NETWORK_ENVIRONMENT_QQ_DEBUG;
    //2.添加到ticker中进行定时刷新
    BK.Director.ticker.add(function(ts,duration){
        game2.updateSocket();
    });

    //PS:. 房主在参加者加入房前 ，不能startGame,否则无法加入房间
    game2.queryAndJoinRoom(gameId,roomId,joinerOpenId,function(statusCode,room){
        if(statusCode == 0){
            BK.Script.log(0,0,"queryAndJoinRoom statusCode:"+ statusCode);
            BK.Script.log(0,0,"当前玩家：");
            room.currentPlayers.forEach(function(player) {
                                        BK.Script.log(1,1,"recvJoinRoom opeid:"+player["openId"] );
                                        BK.Script.log(1,1,"recvJoinRoom joinTs:"+player["joinTs"] );
                                        BK.Script.log(1,1,"recvJoinRoom status:"+player["status"] );
                                    }, this);
            
            game2.leaveRoom();
        }else{
            BK.Script.log(0,0,"加入房间失败。statusCode:"+statusCode);
        }
    });
    return game2;
}

//初始化UI
initUI();

if (isMaster) { 
    BK.Script.log(0,0,"房主模式");       
    masterCreateRoom(openId);
}else{
    BK.Script.log(0,0,"参加者模式");       
    var roomId = GameStatusInfo.roomId
    joinJoinRoom(roomId,openId)
}
