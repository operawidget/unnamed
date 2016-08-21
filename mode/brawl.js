'use strict';
mode.brawl={
    start:function(){
        if(!lib.storage.scene){
            lib.storage.scene={};
        }
        var dialog=ui.create.dialog();
        dialog.classList.add('fixed');
        dialog.classList.add('scroll1');
        dialog.classList.add('scroll2');
        dialog.classList.add('fullwidth');
        dialog.classList.add('fullheight');
        dialog.classList.add('noupdate');
        dialog.classList.add('character');
        dialog.contentContainer.style.overflow='visible';
        dialog.style.overflow='hidden';
        dialog.content.style.height='100%';
        dialog.contentContainer.style.transition='all 0s';
        var packnode=ui.create.div('.packnode',dialog);
        lib.setScroll(packnode);
        var clickCapt=function(){
            var active=this.parentNode.querySelector('.active');
            if(active){
                if(active==this) return;
                for(var i=0;i<active.nodes.length;i++){
                    active.nodes[i].remove();
                    if(active.nodes[i].showcaseinterval){
                        clearInterval(active.nodes[i].showcaseinterval);
                        delete active.nodes[i].showcaseinterval;
                    }
                }
                active.classList.remove('active');
            }
            this.classList.add('active');
            for(var i=0;i<this.nodes.length;i++){
                dialog.content.appendChild(this.nodes[i]);
            }
            var showcase=this.nodes[this.nodes.length-1];
            showcase.style.height=(dialog.content.offsetHeight-showcase.offsetTop)+'px';
            if(typeof showcase.action=='function'){
                showcase.action(showcase._showcased?false:true);
                showcase._showcased=true;
            }
            if(this._nostart) start.style.display='none';
            else start.style.display='';
            game.save('currentBrawl',this.link);
        }
        var createNode=function(name){
            var info=lib.brawl[name];
            var node=ui.create.div('.dialogbutton.menubutton.large',info.name,packnode,clickCapt);
            node.style.transition='all 0s';
            var caption=get.translation(info.mode)+'模式';
            if(info.submode){
                caption+=' - '+info.submode;
            }
            var intro;
            if(Array.isArray(info.intro)){
                intro='<ul style="text-align:left;margin-top:0;width:450px">';
                for(var i=0;i<info.intro.length;i++){
                    intro+='<li>'+info.intro[i];
                }
            }
            else{
                intro=info.intro;
            }
            var showcase=ui.create.div();
            showcase.style.margin='0px';
            showcase.style.padding='0px';
            showcase.style.width='100%';
            showcase.style.display='block'
            showcase.action=info.showcase;
            showcase.link=name;
            if(info.fullshow){
                node.nodes=[showcase];
                showcase.style.height='100%';
            }
            else{
                node.nodes=[
                    ui.create.div('.caption',caption),
                    ui.create.div('.text center',intro),
                    showcase
                ];
            }
            node.link=name;
            node._nostart=info.nostart;
            if(lib.storage.currentBrawl==name){
                clickCapt.call(node);
            }
            return node;
        }
        var start=ui.create.div('.menubutton.round.highlight','斗',dialog.content,function(){
            var active=packnode.querySelector('.active');
            if(active){
                for(var i=0;i<active.nodes.length;i++){
                    if(active.nodes[i].showcaseinterval){
                        clearInterval(active.nodes[i].showcaseinterval);
                        delete active.nodes[i].showcaseinterval;
                    }
                }
                dialog.delete();
                var info=lib.brawl[active.link];
                ui.brawlinfo=ui.create.system('乱斗',null,true);
                lib.setPopped(ui.brawlinfo,function(){
                    var uiintro=ui.create.dialog('hidden');
                    uiintro.add(info.name);
                    uiintro.add('<div class="text center">'+active.nodes[1].innerHTML+'</div>');
                    var ul=uiintro.querySelector('ul');
                    if(ul){
                        ul.style.width='180px';
                    }
                    uiintro.add(ui.create.div('.placeholder'));
                    return uiintro;
                },250);
                _status.brawl=info.content;
                game.switchMode(info.mode);
                if(info.init){
                    info.init();
                }
            }
        });
        start.style.position='absolute';
        start.style.left='auto';
        start.style.right='10px';
        start.style.top='auto';
        start.style.bottom='10px';
        start.style.width='80px';
        start.style.height='80px';
        start.style.lineHeight='80px';
        start.style.margin='0';
        start.style.padding='5px';
        start.style.fontSize='72px';
        start.style.zIndex=3;
        start.style.transition='all 0s';
        game.addScene=function(name){
            var scene=lib.storage.scene[name];
            var brawl={
                name:name,
                intro:scene.intro,
                mode:'identity',
            };
            for(var i in lib.brawl.scene.template){
                brawl[i]=lib.brawl.scene.template[i];
            }
            brawl.content.scene=scene;
            lib.brawl['scene_'+name]=brawl;
            createNode('scene_'+name);
        };
        game.removeScene=function(name){
            delete lib.storage.scene[name];
            game.save('scene',lib.storage.scene);
            for(var i=0;i<packnode.childElementCount;i++){
                if(packnode.childNodes[i].link=='scene_'+name){
                    if(packnode.childNodes[i].classList.contains('active')){
                        clickCapt.call(packnode.childNodes[i].previousSibling);
                    }
                    packnode.childNodes[i].remove();
                    break;
                }
            }
        }
        var sceneNode;
        for(var i in lib.brawl){
            if(i=='scene'){
                sceneNode=createNode(i);
            }
            else{
                createNode(i);
            }
        }
        if(sceneNode){
            game.switchScene=function(){
                clickCapt.call(sceneNode);
            }
        }
        for(var i in lib.storage.scene){
            game.addScene(i);
        }
        if(!lib.storage.currentBrawl){
            clickCapt.call(packnode.firstChild);
        }
    },
    brawl:{
        duzhansanguo:{
            name:'毒战三国',
            mode:'identity',
            intro:'牌堆中额外添加10%的毒',
            showcase:function(init){
                var node=this;
                var func=function(){
                    var card=game.createCard('du','noclick');
                    node.nodes.push(card);
                    card.style.position='absolute';
                    var rand1=Math.round(Math.random()*100);
                    var rand2=Math.round(Math.random()*100);
                    var rand3=Math.round(Math.random()*40)-20;
                    card.style.left='calc('+rand1+'% - '+rand1+'px)';
                    card.style.top='calc('+rand2+'% - '+rand2+'px)';
                    card.style.transform='scale(0.8) rotate('+rand3+'deg)';
                    card.style.opacity=0;
                    node.appendChild(card);
                    ui.refresh(card);
                    card.style.opacity=1;
                    card.style.transform='scale(1) rotate('+rand3+'deg)';
                    if(node.nodes.length>7){
                        setTimeout(function(){
                            while(node.nodes.length>5){
                                node.nodes.shift().delete();
                            }
                        },500);
                    }
                };
                if(init){
                    node.nodes=[];
                    for(var i=0;i<5;i++){
                        func();
                    }
                }
                node.showcaseinterval=setInterval(func,1000);
            },
            content:{
                cardPile:function(list){
                    var num=Math.ceil(list.length/10);
                    while(num--){
                        list.push([['heart','diamond','club','spade'].randomGet(),Math.ceil(Math.random()*13),'du']);
                    }
                    return list;
                }
            },
        },
        daozhiyueying:{
            name:'导师月英',
            mode:'identity',
            intro:'牌堆中所有非延时锦囊牌数量翻倍；移除拥有集智技能的角色',
            showcase:function(init){
                var node=this;
                var player1,player2;
                if(init){
                    player1=ui.create.player(null,true).init('huangyueying');
                    player2=ui.create.player(null,true).init('re_huangyueying');
                    player1.style.left='20px';
                    player1.style.top='20px';
                    player1.style.transform='scale(0.9)';
                    player1.node.count.innerHTML='2';
                    player1.node.count.dataset.condition='mid';
                    player2.style.left='auto';
                    player2.style.right='20px';
                    player2.style.top='20px';
                    player2.style.transform='scale(0.9)';
                    player2.node.count.innerHTML='2';
                    player2.node.count.dataset.condition='mid';
                    this.appendChild(player1);
                    this.appendChild(player2);
                    this.player1=player1;
                    this.player2=player2;
                }
                else{
                    player1=this.player1;
                    player2=this.player2;
                }
                var rect1=player1.getBoundingClientRect();
                var rect2=player2.getBoundingClientRect();
                var left1=rect1.left+rect1.width/2-ui.arena.offsetLeft;
                var left2=rect2.left+rect2.width/2-ui.arena.offsetLeft;
                var top1=rect1.top+rect1.height/2-ui.arena.offsetTop;
                var top2=rect2.top+rect2.height/2-ui.arena.offsetTop;

                var createCard=function(wuxie){
                    var card;
                    if(wuxie){
                        card=game.createCard('wuxie','noclick');
                        card.style.transform='scale(0.9)';
                    }
                    else{
                        card=ui.create.card(null,'noclick',true);
                    }
                    card.style.opacity=0;
                    card.style.position='absolute';
                    card.style.zIndex=2;
                    card.style.margin=0;
                    return card;
                }

                var func=function(){
                    game.linexy([left1,top1,left2,top2]);
                    var card=createCard(true);
                    card.style.left='43px';
                    card.style.top='58px';
                    node.appendChild(card);
                    ui.refresh(card);
                    card.style.opacity=1;
                    card.style.transform='scale(0.9) translate(137px,152px)';
                    setTimeout(function(){
                        card.delete();
                    },1000);
                    player1.node.count.innerHTML='1';

                    setTimeout(function(){
                        if(!node.showcaseinterval) return;
                        player1.node.count.innerHTML='2';
                        var card=createCard();
                        card.style.left='43px';
                        card.style.top='58px';
                        card.style.transform='scale(0.9) translate(137px,152px)';
                        node.appendChild(card);
                        ui.refresh(card);
                        card.style.opacity=1;
                        card.style.transform='scale(0.9)';
                        setTimeout(function(){
                            card.delete();
                        },1000);
                    },300);

                    setTimeout(function(){
                        if(!node.showcaseinterval) return;
                        player2.node.count.innerHTML='1';
                        game.linexy([left2,top2,left1,top1]);
                        var card=createCard(true);
                        card.style.left='auto';
                        card.style.right='43px';
                        card.style.top='58px';
                        node.appendChild(card);
                        ui.refresh(card);
                        card.style.opacity=1;
                        card.style.transform='scale(0.9) translate(-137px,152px)';
                        setTimeout(function(){
                            card.delete();
                        },700);

                        setTimeout(function(){
                            if(!node.showcaseinterval) return;
                            player2.node.count.innerHTML='2';
                            var card=createCard();
                            card.style.left='auto';
                            card.style.right='43px';
                            card.style.top='58px';
                            card.style.transform='scale(0.9) translate(-137px,152px)';
                            node.appendChild(card);
                            ui.refresh(card);
                            card.style.opacity=1;
                            card.style.transform='scale(0.9)';
                            setTimeout(function(){
                                card.delete();
                            },700);
                        },300);
                    },1000);
                };
                node.showcaseinterval=setInterval(func,2200);
                func();
            },
            init:function(){
                for(var i in lib.character){
                    var skills=lib.character[i][3]
                    if(skills.contains('jizhi')||skills.contains('rejizhi')||skills.contains('lingzhou')){
                        delete lib.character[i];
                    }
                }
            },
            content:{
                cardPile:function(list){
                    var list2=[];
                    for(var i=0;i<list.length;i++){
                        list2.push(list[i]);
                        if(get.type(list[i][2])=='trick'){
                            list2.push(list[i]);
                        }
                    }
                    return list2;
                }
            }
        },
        weiwoduzun:{
            name:'唯我独尊',
            mode:'identity',
            intro:[
                '牌堆中杀的数量增加30%',
                '游戏开始时，主公获得一枚战神标记',
                '拥有战神标记的角色杀造成的伤害+1',
                '受到杀造成的伤害后战神印记将移到伤害来源的武将牌上'
            ],
            showcase:function(init){
                var node=this;
                var player;
                if(init){
                    player=ui.create.player(null,true);
                    player.init('boss_lvbu2');
                    player.style.left='calc(50% - 75px)';
                    player.style.top='20px';
                    player.node.count.remove();
                    player.node.hp.remove();
                    player.style.transition='all 0.5s';
                    node.appendChild(player);
                    node.playernode=player;
                }
                else{
                    player=node.playernode;
                }
                var num=0;
                var num2=0;
                this.showcaseinterval=setInterval(function(){
                    var dx,dy
                    if(num2%3==0){
                        player.animate('target');
                        player.animate('zoomin');
                    }
                    num2++;
                    switch(num++){
                        case 0:dx=-180;dy=0;break;
                        case 1:dx=-140;dy=100;break;
                        case 2:dx=0;dy=155;break;
                        case 3:dx=140;dy=100;break;
                        case 4:dx=180;dy=0;break;
                    }
                    if(num>=5){
                        num=0;
                    }
                    var card=game.createCard('sha','noclick');
                    card.style.left='calc(50% - 52px)';
                    card.style.top='68px';
                    card.style.position='absolute';
                    card.style.margin=0;
                    card.style.zIndex=2;
                    card.style.opacity=0;
                    node.appendChild(card);
                    ui.refresh(card);
                    card.style.opacity=1;
                    card.style.transform='translate('+dx+'px,'+dy+'px)';
                    setTimeout(function(){
                        card.delete();
                    },700);
                },700);
            },
            init:function(){
                lib.skill.weiwoduzun={
                    mark:true,
                    intro:{
                        content:'杀造成的伤害+1'
                    },
                    group:['weiwoduzun_damage','weiwoduzun_lose'],
                    subSkill:{
                        damage:{
                            trigger:{source:'damageBegin'},
                            forced:true,
                            filter:function(event){
                                return event.card&&event.card.name=='sha'&&event.notLink();
                            },
                            content:function(){
                                trigger.num++;
                            }
                        },
                        lose:{
                            trigger:{player:'damageEnd'},
                            forced:true,
                            filter:function(event){
                                return event.source&&event.source.isAlive();
                            },
                            content:function(){
                                player.removeSkill('weiwoduzun');
                                trigger.source.addSkill('weiwoduzun');
                            }
                        }
                    }
                };
                lib.translate.weiwoduzun='战神';
                lib.translate.weiwoduzun_bg='尊';
            },
            content:{
                cardPile:function(list){
                    var num=0;
                    for(var i=0;i<list.length;i++){
                        if(list[i][2]=='sha') num++;
                    }
                    num=Math.round(num*0.3);
                    if(num<=0) return list;
                    while(num--){
                        var nature='';
                        var rand=Math.random();
                        if(rand<0.15){
                            nature='fire';
                        }
                        else if(rand<0.3){
                            nature='thunder';
                        }
                        var suit=['heart','spade','club','diamond'].randomGet();
                        var number=Math.ceil(Math.random()*13);
                        if(nature){
                            list.push([suit,number,'sha',nature]);
                        }
                        else{
                            list.push([suit,number,'sha']);
                        }
                    }
                    return list;
                },
                gameStart:function(){
                    if(_status.mode=='zhong'){
                        game.zhong.addSkill('weiwoduzun');
                    }
                    else{
                        game.zhu.addSkill('weiwoduzun');
                    }
                }
            }
        },
        tongxingzhizheng:{
            name:'同姓之争',
            mode:'versus',
            submode:'2v2',
            intro:'姓氏相同的武将组合一队',
            showcase:function(init){
                var node=this;
                var getList=function(){
                    var list=[['guanyu','guanping','guansuo','guanyinping'],
                    ['caocao','caopi','caozhi','caorui'],['liubei','liushan','liuchen'],
                    ['xiahouyuan','xiahouba','xiahoushi'],['sunjian','sunquan','sunce'],
                    ['zhangjiao','zhangliang','zhangbao'],['zhugeliang','zhugeguo','zhugejin','zhugeke'],
                    ['mateng','machao','madai','mayunlu']];
                    list.randomSort();
                    var list2=[];
                    for(var i=0;i<list.length;i++){
                        list2=list2.concat(list[i]);
                    }
                    node.list=list2;
                };
                var func=function(){
                    if(!node.list.length){
                        getList();
                    }
                    var card=ui.create.player(null,true);
                    card.init(node.list.shift());
                    card.node.marks.remove();
                    card.node.count.remove();
                    card.node.hp.remove();
                    node.nodes.push(card);
                    card.style.position='absolute';
                    var rand1=Math.round(Math.random()*100);
                    var rand2=Math.round(Math.random()*100);
                    var rand3=Math.round(Math.random()*40)-20;
                    card.style.left='calc('+rand1+'% - '+(rand1*1.5)+'px)';
                    card.style.top='calc('+rand2+'% - '+(rand2*1.8)+'px)';
                    card.style.transform='scale(1.2) rotate('+rand3+'deg)';
                    card.style.opacity=0;
                    ui.refresh(card);
                    node.appendChild(card);
                    ui.refresh(card);
                    card.style.transform='scale(0.9) rotate('+rand3+'deg)';
                    card.style.opacity=1;
                    if(node.nodes.length>4){
                        setTimeout(function(){
                            while(node.nodes.length>3){
                                node.nodes.shift().delete();
                            }
                        },500);
                    }
                };
                node.list=[];
                if(init){
                    node.nodes=[];
                    for(var i=0;i<3;i++){
                        func();
                    }
                }
                node.showcaseinterval=setInterval(func,1000);
            },
            init:function(){
                var map={};
                var map3=[];
                var list1=['司','夏','诸'];
                var list2=['马','侯','葛'];
                var exclude=['界','新','大'];
                for(var i in lib.character){
                    if(lib.filter.characterDisabled(i)) continue;
                    var surname=lib.translate[i];
                    for(var j=0;j<surname.length;j++){
                        if(exclude.contains(surname[j])) continue;
                        if(!/[a-z]/i.test(surname[j])){
                            var index=list1.indexOf(surname[j]);
                            if(index!=-1&&surname[j+1]==list2[index]){
                                surname=surname[j]+surname[j+1];
                            }
                            else{
                                surname=surname[j];
                            }
                            break;
                        }
                    }
                    if(!map[surname]){
                        map[surname]=[];
                    }
                    map[surname].push(i);
                }
                for(var i in map){
                    if(map[i].length<4){
                        delete map[i];
                    }
                    else{
                        map3.push(i);
                    }
                }
                _status.brawl.map=map;
                _status.brawl.map3=map3;
            },
            content:{
                submode:'two',
                chooseCharacterFixed:true,
                chooseCharacter:function(list,player){
                    if(player.side==game.me.side){
                        if(_status.brawl.mylist){
                            return _status.brawl.mylist.randomGets(2);
                        }
                    }
                    else{
                        if(_status.brawl.enemylist){
                            return _status.brawl.enemylist.randomGets(2);
                        }
                    }
                    var surname=_status.brawl.map3.randomRemove();
                    var list=_status.brawl.map[surname];
                    if(player==game.me){
                        _status.brawl.mylist=list;
                    }
                    else{
                        _status.brawl.enemylist=list;
                    }
                    return list.randomRemove(2);
                }
            }
        },
        tongqueduopao:{
            name:'铜雀夺袍',
            mode:'identity',
            intro:[
                '主公必选曹操',
                '其余玩家从曹休、文聘、曹洪、张郃、夏侯渊、徐晃、许褚这些武将中随机选中一个',
                '游戏开始时将麒麟弓和爪黄飞电各置于每名角色的装备区内，大宛马洗入牌堆，移除其他的武器牌和坐骑牌'
            ],
            init:function(){
                game.saveConfig('player_number','8','identity');
                game.saveConfig('double_character',false,'identity');
            },
            showcase:function(init){
                var node=this;
                var list=['caoxiu','wenpin','caohong','zhanghe','xiahouyuan','xuhuang','re_xuzhu'];
                list.randomSort();
                list.push('re_caocao');
                var func=function(){
                    var card=ui.create.player(null,true);
                    card.init(list.shift());
                    card.node.marks.remove();
                    card.node.count.remove();
                    card.node.hp.remove();
                    node.nodes.push(card);
                    card.style.position='absolute';
                    card.style.zIndex=2;
                    card.style.transition='all 2s';
                    var rand1=Math.round(Math.random()*100);
                    var rand2=Math.round(Math.random()*100);
                    var rand3=Math.round(Math.random()*40)-20;
                    card.style.left='calc('+rand1+'% - '+(rand1*1.5)+'px)';
                    card.style.top='calc('+rand2+'% - '+(rand2*1.8)+'px)';
                    card.style.transform='scale(0.8) rotate('+rand3+'deg)';
                    node.appendChild(card);
                    ui.refresh(card);
                };

                var list2=['qilin','dawan','zhuahuang'];
                var func2=function(){
                    var card=game.createCard(list2.shift(),'noclick');
                    node.nodes.push(card);
                    card.style.position='absolute';
                    card.style.zIndex=2;
                    card.style.transition='all 2s';
                    var rand1=Math.round(Math.random()*100);
                    var rand2=Math.round(Math.random()*100);
                    var rand3=Math.round(Math.random()*40)-20;
                    card.style.left='calc('+rand1+'% - '+rand1+'px)';
                    card.style.top='calc('+rand2+'% - '+rand2+'px)';
                    card.style.transform='rotate('+rand3+'deg)';
                    node.appendChild(card);
                    ui.refresh(card);
                };

                if(init){
                    node.nodes=[];
                }
                else{
                    while(node.nodes.length){
                        node.nodes.shift().remove();
                    }
                }
                for(var i=0;i<5;i++){
                    func();
                }
                for(var i=0;i<3;i++){
                    func2();
                    func();
                }
                var func3=function(){
                    for(var i=0;i<node.nodes.length;i++){
                        var card=node.nodes[i];
                        if(card.classList.contains('player')){
                            var rand1=Math.round(Math.random()*100);
                            var rand2=Math.round(Math.random()*100);
                            var rand3=Math.round(Math.random()*40)-20;
                            card.style.left='calc('+rand1+'% - '+(rand1*1.5)+'px)';
                            card.style.top='calc('+rand2+'% - '+(rand2*1.8)+'px)';
                            card.style.transform='scale(0.8) rotate('+rand3+'deg)';
                        }
                        else{
                            var rand1=Math.round(Math.random()*100);
                            var rand2=Math.round(Math.random()*100);
                            var rand3=Math.round(Math.random()*40)-20;
                            card.style.left='calc('+rand1+'% - '+rand1+'px)';
                            card.style.top='calc('+rand2+'% - '+rand2+'px)';
                            card.style.transform='rotate('+rand3+'deg)';
                        }
                    }
                }
                func3();
                node.showcaseinterval=setInterval(func3,5000);
            },
            content:{
                cardPile:function(list){
                    for(var i=0;i<list.length;i++){
                        var subtype=get.subtype(list[i][2]);
                        if(subtype=='equip1'||subtype=='equip3'||subtype=='equip4'){
                            list.splice(i--,1);
                        }
                    }
                    for(var i=0;i<8;i++){
                        list.push([['heart','diamond','club','spade'].randomGet(),Math.ceil(Math.random()*13),'dawan']);
                    }
                    return list;
                },
                gameStart:function(){
                    for(var i=0;i<game.players.length;i++){
                        game.players[i].$equip(game.createCard('qilin'));
                        game.players[i].$equip(game.createCard('zhuahuang'));
                    }
                },
                submode:'normal',
                list:['caoxiu','wenpin','caohong','zhanghe','xiahouyuan','xuhuang','re_xuzhu'],
                chooseCharacterFixed:true,
                chooseCharacterAi:function(player){
                    if(player==game.zhu){
                        player.init('re_caocao');
                    }
                    else{
                        _status.brawl.list.remove(game.me.name);
                        player.init(_status.brawl.list.randomRemove());
                    }
                },
                chooseCharacter:function(){
                    if(game.me==game.zhu){
                        return ['re_caocao'];
                    }
                    else{
                        _status.brawl.list.randomSort();
                        return _status.brawl.list;
                        // return _status.brawl.list.randomGets(1);
                    }
                }
            }
        },
        // shenrudihou:{
        //     name:'深入敌后',
        //     mode:'versus',
        //     submode:'1v1',
        //     intro:'选将阶段选择武将和对战阶段选择上场的武将都由对手替你选择，而且你不知道对手为你选择了什么武将'
        // },
        tongjiangmoshi:{
            name:'同将模式',
            mode:'identity',
            intro:'玩家选择一个武将，所有角色均使用此武将',
            showcase:function(init){
                if(init){
                    this.nodes=[];
                }
                else{
                    while(this.nodes.length){
                        this.nodes.shift().remove();
                    }
                }
                var lx=this.offsetWidth/2-120;
                var ly=Math.min(lx,this.offsetHeight/2-60);
                var setPos=function(node){
                    var i=node.index;
                    var deg=Math.PI/4*i;
                    var dx=Math.round(lx*Math.cos(deg));
                    var dy=Math.round(ly*Math.sin(deg));
                    node.style.transform='translate('+dx+'px,'+dy+'px)';
                }
                for(var i=0;i<8;i++){
                    var node=ui.create.player(null,true);
                    this.nodes.push(node);
                    node.init('zuoci');
                    node.classList.add('minskin');
                    node.node.marks.remove();
                    node.node.hp.remove();
                    node.node.count.remove();
                    node.style.left='calc(50% - 60px)';
                    node.style.top='calc(50% - 60px)';
                    node.index=i;
                    setPos(node);
                    this.appendChild(node);
                }
                var nodes=this.nodes;
                this.showcaseinterval=setInterval(function(){
                    for(var i=0;i<nodes.length;i++){
                        nodes[i].index++;
                        if(nodes[i].index>7){
                            nodes[i].index=0;
                        }
                        setPos(nodes[i]);
                    }
                },1000);
            },
            content:{
                gameStart:function(){
                    var target=(_status.mode=='zhong')?game.zhong:game.zhu;
                    if(get.config('double_character')){
                        target.init(game.me.name,game.me.name2);
                    }
                    else{
                        target.init(game.me.name);
                    }
                    target.hp++;
                    target.maxHp++;
                    target.update();
                },
                chooseCharacterAi:function(player,list,list2,back){
                    if(player==game.zhu){
                        return;
                    }
                    else{
                        if(get.config('double_character')){
                            player.init(game.me.name,game.me.name2);
                        }
                        else{
                            player.init(game.me.name);
                        }
                    }
                },
                chooseCharacter:function(list,list2,num){
                    if(game.me!=game.zhu){
                        return list.slice(0,list2);
                    }
                    else{
                        if(_status.event.zhongmode){
    						return list.slice(0,6);
    					}
    					else{
    						return list.concat(list2.slice(0,num));
    					}
                    }
                }
            }
        },
        // baiyudujiang:{
        //     name:'白衣渡江',
        //     mode:'versus',
        //     submode:'2v2',
        //     intro:[
        //         '玩家在选将时可从6-8张的武将牌里选择两张武将牌，一张面向大家可见（加入游戏），另一张是隐藏面孔（暗置）',
        //         '选择的两张武将牌需满足以下至少两个条件：1.性别相同；2.体力上限相同；3.技能数量相同',
        //         '每名玩家在其回合开始或回合结束时，可以选择将自己的武将牌弃置，然后使用暗置的武将牌进行剩余的游戏'
        //     ],
        //     content:{
        //         submode:'two',
        //         chooseCharacterNum:2,
        //         chooseCharacterAfter:function(){
        //
        //         }
        //     }
        // }
        scene:{
            name:'自创场景',
            mode:'identity',
            intro:'<div style="position:relative;display:block;margin-bottom:5px">场景名称：<input name="scenename" type="text" style="width:120px"></div><div style="position:relative;display:block">场景说明：<input name="sceneintro" type="text" style="width:120px"></div>',
            content:{
                submode:'normal'
            },
            nostart:true,
            fullshow:true,
            template:{
                init:function(){
                    game.saveConfig('player_number',_status.brawl.scene.players.length,'identity');
                },
                showcase:function(init){
                    if(init){
                        var scene=lib.storage.scene[lib.brawl[this.link].name];
                        ui.create.node('button','编辑场景',this,function(){
                            _status.sceneToLoad=scene;
                            game.switchScene();
                        });
                    }
                },
                content:{
                    submode:'normal',
                    noAddSetting:true,
                    identityShown:true,
                    chooseCharacterBefore:function(){
                        var scene=_status.brawl.scene;
                        var playercontrol=[];
                        var maxpos=0;
                        for(var i=0;i<scene.players.length;i++){
                            if(scene.players[i].playercontrol){
                                playercontrol.push(scene.players[i]);
                            }
                            maxpos=Math.max(maxpos,scene.players[i].position);
                        }

                        if(maxpos<scene.players.length){
                            maxpos=scene.players.length;
                        }
                        var posmap=[];
                        for(var i=1;i<=maxpos;i++){
                            posmap.push(i);
                        }
                        for(var i=0;i<scene.players.length;i++){
                            if(scene.players[i].position){
                                posmap.remove(scene.players[i].position);
                            }
                        }
                        for(var i=0;i<scene.players.length;i++){
                            if(!scene.players[i].position){
                                scene.players[i].position=posmap.randomRemove();
                            }
                        }
                        if(playercontrol.length){
                            game.me.brawlinfo=playercontrol.randomGet();
                        }
                        else{
                            game.me.brawlinfo=scene.players.randomGet();
                        }
                        var getpos=function(info){
                            var dp=info.position-game.me.brawlinfo.position;
                            if(dp<0){
                                dp+=maxpos;
                            }
                            return dp;
                        };
                        scene.players.sort(function(a,b){
                            return getpos(a)-getpos(b);
                        });
                        var target=game.me;
                        _status.firstAct=game.me;
                        for(var i=0;i<scene.players.length;i++){
                            var info=scene.players[i];
                            target.brawlinfo=info;
                            target.identity=info.identity;
                            target.setIdentity(info.identity);
                            if(info.name2!='none'&&info.name2!='random'){
                                if(info.name=='random'){
                                    target.init(info.name2);
                                }
                                else{
                                    target.init(info.name,info.name2);
                                }
                            }
                            else{
                                if(info.name!='random'){
                                    target.init(info.name);
                                }
                            }
                            if(info.linked) target.classList.add('linked');
                            if(info.turnedover) target.classList.add('turnedover');
                            if(target.brawlinfo.position<_status.firstAct.brawlinfo.position) _status.firstAct=target;
                            target=target.next;
                        }
                    },
                    chooseCharacterAi:function(player,list,list2){
                        var info=player.brawlinfo;
                        if(info.name2!='none'){
                            if(info.name=='random'&&info.name2=='random'){
                                list=list.slice(0);
                                player.init(list.randomRemove(),list.randomRemove());
                            }
                            else if(info.name=='random'){
                                player.init(list.randomGet(),info.name2);
                            }
                            else if(info.name2=='random'){
                                player.init(info.name,list.randomGet());
                            }
                        }
                        else{
                            if(info.name=='random'){
                                player.init(list.randomGet());
                            }
                        }
                    },
                    noGameDraw:true,
                }
            },
            showcase:function(init){
                if(init){
                    lib.translate.zhu=lib.translate.zhu||'主';
                    lib.translate.zhong=lib.translate.zhong||'忠';
                    lib.translate.nei=lib.translate.nei||'内';
                    lib.translate.fan=lib.translate.fan||'反';


                    this.style.transition='all 0s';
                    this.style.height=(this.offsetHeight-10)+'px';
                    this.style.overflow='scroll';
                    lib.setScroll(this);
                    var style={marginLeft:'3px',marginRight:'3px'};
                    var style2={position:'relative',display:'block',left:0,top:0,marginBottom:'6px',padding:0,width:'100%'};
                    var style3={marginLeft:'4px',marginRight:'4px',position:'relative'}


                    var scenename=ui.create.node('input',ui.create.div(style2,'','场景名称：',this),{width:'120px'});
                    scenename.type='text';
                    scenename.style.marginTop='20px';
                    var sceneintro=ui.create.node('input',ui.create.div(style2,'','场景名称：',this),{width:'120px'});
                    sceneintro.type='text';
                    sceneintro.style.marginBottom='10px';

                    var line1=ui.create.div(style2,this);
                    var current=null;
                    var addCharacter=ui.create.node('button','添加角色',line1,function(){
                        // line1.style.display='none';
                        resetStatus();
                        editPile.disabled=true;
                        // editCode.disabled=true;
                        saveButton.disabled=true;
                        exportButton.disabled=true;
                        line7.style.display='none';
                        line2.style.display='block';
                        line2_t.style.display='block';
                        line3.style.display='block';
                        line4.style.display='block';
                        line5.style.display='block';
                        line6_h.style.display='block';
                        line6_e.style.display='block';
                        line6_j.style.display='block';
                        capt1.style.display='block';
                        capt2.style.display='block';
                        if(line6_h.childElementCount) capt_h.style.display='block';
                        if(line6_e.childElementCount) capt_e.style.display='block';
                        if(line6_j.childElementCount) capt_j.style.display='block';
                    },style);
                    var editPile=ui.create.node('button','设置状态',line1,function(){
                        resetCharacter();
                        addCharacter.disabled=true;
                        // editCode.disabled=true;
                        saveButton.disabled=true;
                        exportButton.disabled=true;
                        line7.style.display='none';
                        line8.style.display='block';
                        capt8.style.display='block';
                        line9.style.display='block';
                        line10.style.display='block';
                        line11.style.display='block';
                        capt9.style.display='block';
                        line3.style.display='block';

                        line6_t.style.display='block';
                        line6_b.style.display='block';
                        line6_d.style.display='block';
                        if(line6_t.childElementCount) capt_t.style.display='block';
                        if(line6_b.childElementCount) capt_b.style.display='block';
                        if(line6_d.childElementCount) capt_d.style.display='block';
                    },style);
                    // var editCode=ui.create.node('button','编辑代码',line1,function(){
                    //     console.log(1);
                    // },style);
                    var saveButton=ui.create.node('button','保存场景',line1,function(){
                        if(!scenename.value){
                            alert('请填写场景名称');
                            return;
                        }
                        var scene={
                            name:scenename.value,
                            intro:sceneintro.value,
                            players:[],
                            cardPileTop:[],
                            cardPileBottom:[],
                            discardPile:[],
                        };
                        for(var i=0;i<line7.childElementCount;i++){
                            scene.players.push(line7.childNodes[i].info);
                        }
                        if(scene.players.length<2){
                            alert('请添加至少两名角色');
                            return;
                        }
                        if(!_status.currentScene){
                            if(lib.storage.scene[scenename.value]){
                                if(!confirm('场景名与现有场景重复，是否覆盖？')){
                                    return;
                                }
                                game.removeScene(scenename.value);
                            }
                        }
                        for(var i=0;i<line6_t.childElementCount;i++){
                            scene.cardPileTop.push(line6_t.childNodes[i].info);
                        }
                        for(var i=0;i<line6_b.childElementCount;i++){
                            scene.cardPileBottom.push(line6_b.childNodes[i].info);
                        }
                        for(var i=0;i<line6_d.childElementCount;i++){
                            scene.discardPile.push(line6_d.childNodes[i].info);
                        }
                        if(replacepile.checked){
                            scene.replacePile=true;
                        }
                        if(turnsresult.value!='none'){
                            scene.turns=[parseInt(turns.value),turnsresult.value]
                        }
                        if(washesresult.value!='none'){
                            scene.washes=[parseInt(washes.value),washesresult.value]
                        }
                        lib.storage.scene[scene.name]=scene;
                        game.save('scene',lib.storage.scene);
                        game.addScene(scene.name);
                    },style);
                    var exportButton=ui.create.node('button','导出扩展',line1,function(){
                        console.log(1);
                    },style);


                    var capt1=ui.create.div(style2,'','角色信息',this);
                    var line2=ui.create.div(style2,this);
                    line2.style.display='none';
                    var identity=ui.create.selectlist([['zhu','主公'],['zhong','忠臣'],['nei','内奸'],['fan','反贼']],'zhu',line2);
                    identity.value='fan';
                    identity.style.marginLeft='3px';
                    identity.style.marginRight='3px';
                    var position=ui.create.selectlist([['0','随机位置'],['1','一号位'],['2','二号位'],['3','三号位'],['4','四号位'],['5','五号位'],['6','六号位'],['7','七号位'],['8','八号位']],'1',line2);
                    position.style.marginLeft='3px';
                    position.style.marginRight='3px';
                    var line2_t=ui.create.div(style2,this);
                    line2_t.style.display='none';
                    // line2_t.style.marginBottom='10px';
                    ui.create.node('span','体力：',line2_t);
                    var hp=ui.create.node('input',line2_t,{width:'40px'});
                    hp.type='text';
                    ui.create.node('span','体力上限：',line2_t,{marginLeft:'10px'});
                    var maxHp=ui.create.node('input',line2_t,{width:'40px'});
                    maxHp.type='text';
                    ui.create.node('span','横置 ',line2_t,{marginLeft:'20px'});
                    var linked=ui.create.node('input',line2_t);
                    linked.type='checkbox';
                    ui.create.node('span','翻面 ',line2_t,{marginLeft:'10px'});
                    var turnedover=ui.create.node('input',line2_t);
                    turnedover.type='checkbox';
                    ui.create.node('span','玩家 ',line2_t,{marginLeft:'10px'});
                    var playercontrol=ui.create.node('input',line2_t);
                    playercontrol.type='checkbox';

                    var list=[];
                    for(var i in lib.character){
                        list.push([i,lib.translate[i]]);
                    }

                    list.sort(function(a,b){
                        a=a[0];b=b[0];
                        var aa=a,bb=b;
                        if(aa.indexOf('_')!=-1){
                            aa=aa.slice(aa.indexOf('_')+1);
                        }
                        if(bb.indexOf('_')!=-1){
                            bb=bb.slice(bb.indexOf('_')+1);
                        }
                        if(aa!=bb){
                            return aa>bb?1:-1;
                        }
                        return a>b?1:-1;
                    });
                    list.unshift(['random','自选主将']);
                    var name1=ui.create.selectlist(list,list[0],line2);
                    name1.style.marginLeft='3px';
                    name1.style.marginRight='3px';
                    name1.style.maxWidth='80px';
                    list[0][1]='自选副将';
                    list.unshift(['none','无副将']);
                    var name2=ui.create.selectlist(list,list[0],line2);
                    name2.style.marginLeft='3px';
                    name2.style.marginRight='3px';
                    name2.style.maxWidth='80px';

                    var capt9=ui.create.div(style2,'','编辑牌堆',this);
                    capt9.style.display='none';


                    var capt2=ui.create.div(style2,'','添加卡牌',this);
                    var line3=ui.create.div(style2,this);
                    line3.style.display='none';
                    capt1.style.display='none';
                    capt2.style.display='none';

                    var line5=ui.create.div(style2,this);
                    line5.style.display='none';
                    var pileaddlist=[];
                    for(var i=0;i<lib.config.cards.length;i++){
                        if(!lib.cardPack[lib.config.cards[i]]) continue;
                        for(var j=0;j<lib.cardPack[lib.config.cards[i]].length;j++){
                            var cname=lib.cardPack[lib.config.cards[i]][j];
                            pileaddlist.push([cname,get.translation(cname)]);
                            if(cname=='sha'){
                                pileaddlist.push(['huosha','火杀']);
                                pileaddlist.push(['leisha','雷杀']);
                            }
                        }
                    }
                    for(var i in lib.cardPack){
                        if(lib.config.all.cards.contains(i)) continue;
                        for(var j=0;j<lib.cardPack[i].length;j++){
                            var cname=lib.cardPack[i][j];
                            pileaddlist.push([cname,get.translation(cname)]);
                        }
                    }
                    pileaddlist.unshift(['random',['随机卡牌']]);
                    var cardpileaddname=ui.create.selectlist(pileaddlist,null,line3);
                    cardpileaddname.style.marginLeft='3px';
                    cardpileaddname.style.marginRight='3px';
                    cardpileaddname.style.width='85px';
                    var cardpileaddsuit=ui.create.selectlist([
                        ['random','随机花色'],
                        ['heart','红桃'],
                        ['diamond','方片'],
                        ['club','梅花'],
                        ['spade','黑桃'],
                    ],null,line3);
                    cardpileaddsuit.style.marginLeft='3px';
                    cardpileaddsuit.style.marginRight='3px';
                    cardpileaddsuit.style.width='85px';
                    var cardpileaddnumber=ui.create.selectlist([
                        ['random','随机点数'],1,2,3,4,5,6,7,8,9,10,11,12,13
                    ],null,line3);
                    cardpileaddnumber.style.marginLeft='3px';
                    cardpileaddnumber.style.marginRight='3px';
                    cardpileaddnumber.style.width='85px';

                    var fakecard=function(name,suit,number){
                        var card=ui.create.card(null,'noclick',true);
                        card.style.zoom=0.6;
                        number=parseInt(cardpileaddnumber.value);
                        var name2=name;
                        var suit2=suit;
                        var number2=number;
                        if(name2=='random') name2='sha';
                        if(suit2=='random') suit2='?';
                        if(!number2){
                            number='random';
                            number2='?';
                        }
                        card.init([suit2,number2,name2]);
                        card.info=[name,suit,number];
                        if(name=='random'){
                            card.node.name.innerHTML=get.verticalStr('随机卡牌');
                        }
                        return card;
                    };
                    var cc_h=ui.create.node('button','加入手牌区',line5,function(){
                        var card=fakecard(cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value);
                        card.listen(function(){
                            this.remove();
                            if(!line6_h.childElementCount) capt_h.style.display='none';
                        });
                        line6_h.appendChild(card);
                        capt_h.style.display='block';
                    });
                    var cc_e=ui.create.node('button','加入装备区',line5,function(){
                        if(get.type(cardpileaddname.value)!='equip') return;
                        var subtype=get.subtype(cardpileaddname.value);
                        for(var i=0;i<line6_e.childElementCount;i++){
                            if(get.subtype(line6_e.childNodes[i].name)==subtype){
                                line6_e.childNodes[i].remove();break;
                            }
                        }
                        var card=fakecard(cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value);
                        card.listen(function(){
                            this.remove();
                            if(!line6_e.childElementCount) capt_e.style.display='none';
                        });
                        line6_e.appendChild(card);
                        capt_e.style.display='block';
                    });
                    var cc_j=ui.create.node('button','加入判定区',line5,function(){
                        if(get.type(cardpileaddname.value)!='delay') return;
                        for(var i=0;i<line6_j.childElementCount;i++){
                            if(line6_j.childNodes[i].name==cardpileaddname.value){
                                line6_j.childNodes[i].remove();break;
                            }
                        }
                        var card=fakecard(cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value);
                        card.listen(function(){
                            this.remove();
                            if(!line6_j.childElementCount) capt_j.style.display='none';
                        });
                        line6_j.appendChild(card);
                        capt_j.style.display='block';
                    });
                    cc_h.style.marginLeft='3px';
                    cc_h.style.marginRight='3px';
                    cc_h.style.width='85px';
                    cc_e.style.marginLeft='3px';
                    cc_e.style.marginRight='3px';
                    cc_e.style.width='85px';
                    cc_j.style.marginLeft='3px';
                    cc_j.style.marginRight='3px';
                    cc_j.style.width='85px';

                    var capt_h=ui.create.div(style2,'','手牌区',this);
                    var line6_h=ui.create.div(style2,this);
                    var capt_e=ui.create.div(style2,'','装备区',this);
                    var line6_e=ui.create.div(style2,this);
                    var capt_j=ui.create.div(style2,'','判定区',this);
                    var line6_j=ui.create.div(style2,this);
                    line6_j.style.marginBottom='10px';
                    capt_h.style.display='none';
                    capt_e.style.display='none';
                    capt_j.style.display='none';

                    var line10=ui.create.div(style2,this);
                    line10.style.display='none';
                    var ac_h=ui.create.node('button','加入牌堆顶',line10,function(){
                        var card=fakecard(cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value);
                        card.listen(function(){
                            this.remove();
                            if(!line6_t.childElementCount) capt_t.style.display='none';
                        });
                        line6_t.appendChild(card);
                        capt_t.style.display='block';
                    });
                    var ac_e=ui.create.node('button','加入牌堆底',line10,function(){
                        var card=fakecard(cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value);
                        card.listen(function(){
                            this.remove();
                            if(!line6_b.childElementCount) capt_b.style.display='none';
                        });
                        line6_b.appendChild(card);
                        capt_b.style.display='block';
                    });
                    var ac_j=ui.create.node('button','加入弃牌堆',line10,function(){
                        var card=fakecard(cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value);
                        card.listen(function(){
                            this.remove();
                            if(!line6_d.childElementCount) capt_d.style.display='none';
                        });
                        line6_d.appendChild(card);
                        capt_d.style.display='block';
                    });
                    ac_h.style.marginLeft='3px';
                    ac_h.style.marginRight='3px';
                    ac_h.style.width='85px';
                    ac_e.style.marginLeft='3px';
                    ac_e.style.marginRight='3px';
                    ac_e.style.width='85px';
                    ac_j.style.marginLeft='3px';
                    ac_j.style.marginRight='3px';
                    ac_j.style.width='85px';

                    var line11=ui.create.div(style2,this,'','替换牌堆');
                    line11.style.display='none';
                    var replacepile=ui.create.node('input',line11);
                    replacepile.type='checkbox';

                    var capt_t=ui.create.div(style2,'','牌堆顶',this);
                    var line6_t=ui.create.div(style2,this);
                    var capt_b=ui.create.div(style2,'','牌堆底',this);
                    var line6_b=ui.create.div(style2,this);
                    var capt_d=ui.create.div(style2,'','弃牌堆',this);
                    var line6_d=ui.create.div(style2,this);
                    line6_d.style.marginBottom='10px';
                    capt_t.style.display='none';
                    capt_b.style.display='none';
                    capt_d.style.display='none';

                    var line4=ui.create.div(style2,this);
                    line4.style.display='none';
                    line4.style.marginTop='20px';
                    var resetCharacter=function(){
                        // line1.style.display='block';
                        editPile.disabled=false;
                        // editCode.disabled=false;
                        saveButton.disabled=false;
                        exportButton.disabled=false;
                        line7.style.display='block';
                        line2.style.display='none';
                        line2_t.style.display='none';
                        line3.style.display='none';
                        line4.style.display='none';
                        line5.style.display='none';
                        line6_h.style.display='none';
                        line6_e.style.display='none';
                        line6_j.style.display='none';
                        capt1.style.display='none';
                        capt2.style.display='none';
                        capt_h.style.display='none';
                        capt_e.style.display='none';
                        capt_j.style.display='none';

                        name1.value='random';
                        name2.value='none';
                        identity.value='fan';
                        position.value='0';
                        hp.value='';
                        maxHp.value='';
                        line6_h.innerHTML='';
                        line6_e.innerHTML='';
                        line6_j.innerHTML='';
                        cardpileaddname.value='random';
                        cardpileaddsuit.value='random';
                        cardpileaddnumber.value='random';
                        linked.checked=false;
                        turnedover.checked=false;
                        playercontrol.checked=false;
                    };
                    var createCharacter=function(info){
                        var player=ui.create.player(null,true);
                        player.info=info;
                        var name=info.name,name3=info.name2;
                        if(name=='random'){
                            name='re_caocao';
                        }
                        if(name3!='none'){
                            if(name3=='random'){
                                name3='liubei';
                            }
                            player.init(name,name3);
                            if(info.name2=='random'){
                                player.node.name2.innerHTML=get.verticalStr('随机副将');
                            }
                        }
                        else{
                            player.init(name);
                        }
                        if(info.name=='random'){
                            player.node.name.innerHTML=get.verticalStr('随机主将');
                        }
                        if(info.maxHp){
                            player.maxHp=info.maxHp;
                        }
                        if(info.hp){
                            player.hp=Math.min(info.hp,player.maxHp);
                        }
                        for(var i=0;i<info.handcards.length;i++){
                            player.node.handcards1.appendChild(ui.create.card());
                        }
                        for(var i=0;i<info.equips.length;i++){
                            player.$equip(fakecard.apply(this,info.equips[i]));
                        }
                        for(var i=0;i<info.judges.length;i++){
                            player.node.judges.appendChild(fakecard.apply(this,info.judges[i]));
                        }
                        player.setIdentity(info.identity);
                        var pos=info.position;
                        if(pos==0){
                            pos='随机位置';
                        }
                        else{
                            pos=get.cnNumber(pos,true)+'号位'
                        }
                        if(info.linked&&info.turnedover){
                            pos+='<br>横置 - 翻面'
                        }
                        else{
                            if(info.linked) pos+=' - 横置';
                            if(info.turnedover) pos+=' - 翻面';
                        }
                        player.setNickname(pos);
                        player.update();
                        player.style.transform='scale(0.7)';
                        player.style.position='relative';
                        player.style.left=0;
                        player.style.top=0;
                        player.style.margin='-18px';
                        player.node.marks.remove();
                        return player;
                    };
                    ui.create.div('.menubutton.large','确定',line4,style3,function(){
                        var info={
                            name:name1.value,
                            name2:name2.value,
                            identity:identity.value,
                            position:parseInt(position.value),
                            hp:parseInt(hp.value),
                            maxHp:parseInt(maxHp.value),
                            linked:linked.checked,
                            turnedover:turnedover.checked,
                            playercontrol:playercontrol.checked,
                            handcards:[],
                            equips:[],
                            judges:[]
                        };
                        for(var i=0;i<line7.childElementCount;i++){
                            if(info.identity=='zhu'&&line7.childNodes[i].info.identity=='zhu'){
                                alert('不能有两个主公');
                                return;
                            }
                            if(info.position!=0&&info.position==line7.childNodes[i].info.position){
                                alert('座位与现在角色相同');
                                return;
                            }
                        }
                        for(var i=0;i<line6_h.childElementCount;i++){
                            info.handcards.push([line6_h.childNodes[i].name,line6_h.childNodes[i].suit,line6_h.childNodes[i].number]);
                        }
                        for(var i=0;i<line6_e.childElementCount;i++){
                            info.equips.push([line6_e.childNodes[i].name,line6_e.childNodes[i].suit,line6_e.childNodes[i].number]);
                        }
                        for(var i=0;i<line6_j.childElementCount;i++){
                            info.judges.push([line6_j.childNodes[i].name,line6_j.childNodes[i].suit,line6_j.childNodes[i].number]);
                        }
                        var player=createCharacter(info);
                        line7.appendChild(player);
                        player.listen(function(){
                            if(confirm('是否删除此角色？')){
                                this.remove();
                                if(line7.childElementCount<8){
                                    addCharacter.disabled=false;
                                }
                            }
                        });
                        if(line7.childElementCount>=8){
                            addCharacter.disabled=true;
                        }
                        resetCharacter();
                    });
                    ui.create.div('.menubutton.large','取消',line4,style3,resetCharacter);
                    var line7=ui.create.div(style2,this);
                    line7.style.marginTop='12px';


                    var capt8=ui.create.div(style2,'','胜负条件',this);
                    capt8.style.display='none';
                    var line8=ui.create.div(style2,this);
                    line8.style.display='none';
                    line8.style.marginTop='10px';
                    line8.style.marginBottom='10px';
                    var turnslist=[['1','一'],['2','二'],['3','三'],['4','四'],['5','五'],['6','六'],['7','七'],['8','八'],['9','九'],['10','十']];
                    var results=[['none','无'],['win','胜利'],['lose','失败'],['tie','平局']];
                    var turns=ui.create.selectlist(turnslist,'1',line8);
                    ui.create.node('span','个回合后',line8,style);
                    var turnsresult=ui.create.selectlist(results,'none',line8);


                    var washes=ui.create.selectlist(turnslist,'1',line8);
                    washes.style.marginLeft='20px';
                    ui.create.node('span','次洗牌后',line8,style);
                    var washesresult=ui.create.selectlist(results,'none',line8);

                    var line9=ui.create.div(style2,this);
                    line9.style.display='none';
                    line9.style.marginTop='20px';
                    var resetStatus=function(all){
                        if(line7.childElementCount>=8){
                            addCharacter.disabled=true;
                        }
                        else{
                            addCharacter.disabled=false;
                        }
                        // editCode.disabled=false;
                        saveButton.disabled=false;
                        exportButton.disabled=false;
                        cardpileaddname.value='random';
                        cardpileaddsuit.value='random';
                        cardpileaddnumber.value='random';

                        line8.style.display='none';
                        capt8.style.display='none';
                        capt9.style.display='none';
                        line9.style.display='none';
                        line10.style.display='none';
                        line11.style.display='none';
                        line3.style.display='none';
                        line7.style.display='block';


                        line6_t.style.display='none';
                        line6_b.style.display='none';
                        line6_d.style.display='none';
                        capt_t.style.display='none';
                        capt_b.style.display='none';
                        capt_d.style.display='none';

                        if(all===true){
                            replacepile.checked=false;
                            turns.value='1';
                            turnsresult.value='none';
                            washes.value='1';
                            washesresult.value='none';
                            line6_t.innerHTML='';
                            line6_b.innerHTML='';
                            line6_d.innerHTML='';
                        }
                    }

                    ui.create.div('.menubutton.large','确定',line9,style3,resetStatus);

                    game.loadScene=function(scene){
                        resetCharacter();
                        resetStatus(true);
                    }
                }
                if(_status.sceneToLoad){
                    var scene=_status.sceneToLoad;
                    delete _status.sceneToLoad;
                    game.loadScene(scene);
                }
            }
        }
    },
};
