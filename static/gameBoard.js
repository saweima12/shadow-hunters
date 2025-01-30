//gameboard scene: this is the actual canvas for the game!
var GameBoard = new Phaser.Class ({
    Extends: Phaser.Scene,

    initialize:

    function Board () {
        // this names the scene we are in
        Phaser.Scene.call(this, { key: 'board' });

        // this allows clicking in our game
        this.allowClick = true;

        //this is where all of the objects specific to our scene will appear
        this.arsenal = [];
        this.healthBar;
        this.player;
        this.allPlayersInfo;
        this.nPlayers;
        this.otherPlayers = {};
        this.tip;
        this.gameData;
        this.charInfo;
        this.infoBox;
        this.popupInfo;
        this.openPopups = [];
        this.gameEnd = {image: [], winners: [], players_info: []};
        this.cards = {cardsDrawn: [], cardText: [], nDrawn: 0};
        this.gameSummary;
        this.dice = [];

        // list of x, y coordinates for 8 players' starting spots
        this.startSpots = [[562, 245],
        [504, 245],
        [533, 215],
        [533, 275],
        [591, 275],
        [510, 185],
        [556, 185],
        [475, 275]
        ];

        // Player location coordinates (row = player number, even columns are x coords, odd columns are y coords)
        this.allSpots = [[398.483,220.233,468.420,163.359,601.778,163.359,671.715,220.233,514.936,437.763,561.010,390.301],
        [423.487,208.877,472.424,122.003,597.774,122.003,646.711,208.877,457.931,390.407,576.005,428.945],
        [419.487,247.874,448.424,132.000,621.774,132.000,650.711,247.874,471.931,420.404,624.005,389.942],
        [394.972,180.750,448.737, 91.851,621.461, 91.851,675.226,180.750,521.618,387.255,595.521,393.817],
        [444.304,203.018,423.086,137.467,647.112,137.467,625.894,203.018,494.025,394.626,608.189,437.086],
        [378.242,228.124,499.237,113.250,570.961,113.250,691.956,228.124,449.118,434.654,550.251,428.192],
        [346.934,152.375,373.233, 97.393,696.965, 97.393,723.264,152.375,509.887,326.988,613.559,330.442],
        [323.822,194.484,403.492, 64.687,666.706, 64.687,746.376,194.484,453.340,329.579,562.671,326.552]
        ];

        //y coordinates of all possible spots on health bar
        // Why are there two of these - not sure which to change, so changed both
        this.hpSpots = [582];
        this.hpStart = 582;
        this.zoneCards = [[],[],[]];
        this.zoneSpots = [[382.000, 201.500, 433.000, 113.250],
        [633.000, 113.250, 684.250, 201.750],
        [482.000, 382.712, 584.000, 382.712]
        ];
    },

    //function to initialize the data sent into gameboard from waiting room
    init: function (data)
    {
        // Remove start button
        $('#start').remove();
        $('#selectPlayers').remove();

        // Store data
        this.gameData = data;
        if("private" in this.gameData) this.charInfo = this.gameData.private.character;
        this.allPlayersInfo = this.gameData.public.players;

    },

    //the preload function is where all images that will be used in the game are loaded into
    preload: function () {
        // url where gfx resources are stored
        var gfx = `${location.protocol}//${location.host}/static/assets/`;


        // loading screen
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(385.5, 285, 305, 30);
        var assetText = this.make.text({
            x: 543,
            y: 350,
            text: '',
            style: {
                font: '12px Palatino',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(388, 287.5, 300 * value, 25);
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading visual elements...');
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            assetText.destroy();
        });


        // load background and health bar
        this.load.svg('background', gfx + 'background.svg', {width: 1066, height: 600});
        this.load.svg('popup', gfx + 'player-popup.svg', {width: 260.736, height: 91.000});
        this.load.svg('popup_left', gfx + 'player-popleft.svg', {width: 175.424, height: 84.961});
        this.load.svg('popup_right', gfx + 'player-popright.svg', {width: 175.424, height: 84.961});
        this.load.svg('health', gfx + 'health.svg', {width: 206.681, height: 589.442});
        this.load.svg('health_popup', gfx + 'health-popup.svg', {width: 100, height: 335});
        this.load.image('summary', gfx + 'scroll.png');
        this.load.image('info', gfx + 'info.png');

        // load arsenal
        this.load.svg('arsenal', gfx + 'arsenal.svg', {width: 640, height: 125.683});

        // load the location cards
        this.load.svg('Hermit\'s Cabin', gfx + 'hermits_cabin.svg', {width: 101, height: 150});
        this.load.svg('Underworld Gate', gfx + 'underworld_gate.svg', {width: 101, height: 150});
        this.load.svg('Church', gfx + 'church.svg', {width: 101, height: 150});
        this.load.svg('Cemetery', gfx + 'cemetery.svg', {width: 101, height: 150});
        this.load.svg('Weird Woods', gfx + 'weird_woods.svg', {width: 101, height: 150});
        this.load.svg('Erstwhile Altar', gfx + 'erstwhile_altar.svg', {width: 101, height: 150});

        // load player sprites and hp trackers
        this.load.svg('player1', gfx + 'white-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player2', gfx + 'black-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player3', gfx + 'green-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player4', gfx + 'blue-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player5', gfx + 'pink-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player6', gfx + 'red-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player7', gfx + 'yellow-person.svg', {width: 50.5, height: 37.5});
        this.load.svg('player8', gfx + 'orange-person.svg', {width: 50.5, height: 37.5});

        this.load.svg('circle1', gfx + 'white_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle2', gfx + 'black_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle3', gfx + 'green_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle4', gfx + 'blue_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle5', gfx + 'pink_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle6', gfx + 'red_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle7', gfx + 'yellow_circle.svg', {width: 123.633, height: 123.633});
        this.load.svg('circle8', gfx + 'orange_circle.svg', {width: 123.633, height: 123.633});

        this.load.svg('hpp1', gfx + 'whiteDot.svg', {width: 15, height: 15});
        this.load.svg('hpp2', gfx + 'blackDot.svg', {width: 15, height: 15});
        this.load.svg('hpp3', gfx + 'greenDot.svg', {width: 15, height: 15});
        this.load.svg('hpp4', gfx + 'blueDot.svg', {width: 15, height: 15});
        this.load.svg('hpp5', gfx + 'pinkDot.svg', {width: 15, height: 15});
        this.load.svg('hpp6', gfx + 'redDot.svg', {width: 15, height: 15});
        this.load.svg('hpp7', gfx + 'yellowDot.svg', {width: 15, height: 15});
        this.load.svg('hpp8', gfx + 'orangeDot.svg', {width: 15, height: 15});

        this.load.svg('playerinfo', gfx + 'playerinfo.svg', {width: 209, height: 125});

        this.load.svg('8hp', gfx + '8hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('10hp', gfx + '10hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('11hp', gfx + '11hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('12hp', gfx + '12hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('13hp', gfx + '13hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('14hp', gfx + '14hp.svg', {width: 30.14, height: 30.14});
        this.load.svg('A', gfx + 'a.svg', {width: 36.657, height: 36.657});
        this.load.svg('B', gfx + 'b.svg', {width: 36.657, height: 36.657});
        this.load.svg('C', gfx + 'c.svg', {width: 36.657, height: 36.657});
        this.load.svg('U', gfx + 'u.svg', {width: 36.657, height: 36.657});
        this.load.svg('V', gfx + 'v.svg', {width: 36.657, height: 36.657});
        this.load.svg('W', gfx + 'w.svg', {width: 36.657, height: 36.657});
        this.load.svg('E', gfx + 'e.svg', {width: 36.657, height: 36.657});
        this.load.svg('F', gfx + 'f.svg', {width: 36.657, height: 36.657});
        this.load.svg('G', gfx + 'g.svg', {width: 36.657, height: 36.657});

        // possible later implementation: loop through dumped list of playable characters to load images?
        this.load.image('Allie', gfx + 'Allie.png');
        this.load.image('George', gfx + 'George.png');
        this.load.image('Fu-ka', gfx + 'Fu-ka.png');
        this.load.image('Valkyrie', gfx + 'Valkyrie.png');
        this.load.image('Vampire', gfx + 'Vampire.png');
        this.load.image('Bob', gfx + 'Bob.png');
        this.load.image('Catherine', gfx + 'Catherine.png');
        this.load.image('Franklin', gfx + 'Franklin.png');
        this.load.image('Ellen', gfx + 'Ellen.png');
        this.load.image('Ultra Soul', gfx + 'Ultrasoul.png');
        this.load.image('Werewolf', gfx + 'Werewolf.png');
        this.load.image('Anon', gfx + 'anon.png');

        //display pop ups
        this.load.svg('gameOver', gfx + 'gameOver.svg', {width: 642, height: 590});
        this.load.svg('gameSummary', gfx + 'gameSummary.svg', {width: 608.184, height: 590});
        this.load.svg('whitecard', gfx + 'whitecard.svg', {width: 150, height: 200});
        this.load.svg('blackcard', gfx + 'blackcard.svg', {width: 150, height: 200});
        this.load.svg('greencard', gfx + 'greencard.svg', {width: 150, height: 200});
        this.load.svg('redcard', gfx + 'redcard.svg', {width: 150, height: 200});
        this.load.svg('alert', gfx + 'alert.svg', {width: 318.804, height: 101.562});
        this.load.svg('4die', gfx + '4sided.svg', {width: 60, height: 50});
        this.load.svg('6die', gfx + '6sided.svg', {width: 50, height: 50});

        // load bitmap text
        this.load.bitmapFont('adventur', gfx + 'Adventur.png', gfx + 'Adventur.fnt');

        // load the card images
        this.load.svg('Advent', gfx + 'advent.svg', {width: 90, height: 90});
        this.load.svg('Banana Peel', gfx + 'banana-peel.svg', {width: 90, height: 90});
        this.load.svg('Blessing', gfx + 'blessing.svg', {width: 90, height: 90});
        this.load.svg('Bloodthirsty Spider', gfx + 'bloodthirsty-spider.svg', {width: 90, height: 90});
        this.load.svg('Butcher Knife', gfx + 'butcher-knife.svg', {width: 90, height: 90});
        this.load.svg('Chainsaw', gfx + 'chainsaw.svg', {width: 90, height: 90});
        this.load.svg('Chocolate', gfx + 'chocolate.svg', {width: 90, height: 90});
        this.load.svg('Concealed Knowledge', gfx + 'hidden-knowledge.svg', {width: 90, height: 90});
        this.load.svg('Cursed Sword Masamune', gfx + 'cursed-sword-masamune.svg', {width: 90, height: 90});
        this.load.svg('Diabolic Ritual', gfx + 'diabolic-ritual.svg', {width: 90, height: 90});
        this.load.svg('Disenchant Mirror', gfx + 'disenchant-mirror.svg', {width: 90, height: 90});
        this.load.svg('Dynamite', gfx + 'dynamite.svg', {width: 90, height: 90});
        this.load.svg('First Aid', gfx + 'first-aid.svg', {width: 90, height: 90});
        this.load.svg('Flare of Judgement', gfx + 'flare-of-judgement.svg', {width: 90, height: 90});
        this.load.svg('Fortune Brooch', gfx + 'fortune-brooch.svg', {width: 90, height: 90});
        this.load.svg('Guardian Angel', gfx + 'guardian-angel.svg', {width: 90, height: 90});
        this.load.svg('Handgun', gfx + 'handgun.svg', {width: 90, height: 90});
        this.load.svg('Holy Robe', gfx + 'holy-robe.svg', {width: 90, height: 90});
        this.load.svg('Hermit', gfx + 'hermit.svg', {width: 90, height: 90});
        this.load.svg('Holy Water of Healing', gfx + 'holy-water-of-healing.svg', {width: 90, height: 90});
        this.load.svg('Machine Gun', gfx + 'machine-gun.svg', {width: 90, height: 90});
        this.load.svg('Moody Goblin', gfx + 'moody-goblin.svg', {width: 90, height: 90});
        this.load.svg('Mystic Compass', gfx + 'mystic-compass.svg', {width: 90, height: 90});
        this.load.svg('Rusted Broad Axe', gfx + 'rusted-broad-axe.svg', {width: 90, height: 90});
        this.load.svg('Silver Rosary', gfx + 'silver-rosary.svg', {width: 90, height: 90});
        this.load.svg('Spear of Longinus', gfx + 'spear-of-longinus.svg', {width: 90, height: 90});
        this.load.svg('Spiritual Doll', gfx + 'spiritual-doll.svg', {width: 90, height: 90});
        this.load.svg('Talisman', gfx + 'talisman.svg', {width: 90, height: 90});
        this.load.svg('Vampire Bat', gfx + 'vampire-bat.svg', {width: 90, height: 90});

    },

    //the create function is where everything is added to the canvas
    create: function () {
        var self = this;

        //this adds our background image. the x, y coordinates provided are the center of the canvas
        var background = this.add.image(533, 300, 'background');
        background.setScale(1);

        // Add healthbar
        this.healthBar = this.makeHealthBar();
        this.healthBar.on('clicked', this.clickHandler, this.box);

        // adds info button on upper right corner so people know they can click on things. Starts with popup open
        this.infoImg = this.add.image(830, 20, 'info');
        this.popupInfo = this.add.sprite(820, 40); // Hack to align hitbox with image - phaser is stupid
        this.popupInfo.infoBox = this.add.image(740, 55, "popup_left");
        this.popupInfo.infoBox.depth = 30;
        this.popupInfo.displayInfo = this.add.text(this.popupInfo.infoBox.x - 80,
          this.popupInfo.infoBox.y - 40,
          "Click on things to see more information! Click on the i button to close this popup.",
          { font: '12px Palatino', fill: '#FFFFFF',
          wordWrap: { width: 130, useAdvancedWrap: true }});
        this.popupInfo.displayInfo.depth = 30;
        this.popupInfo.setInteractive();
        this.popupInfo.on('clicked', this.clickHandler, this.popupInfo);
        this.popupInfo.infoBox.setVisible(true);
        this.popupInfo.displayInfo.setVisible(true);
        this.openPopups.push(this.popupInfo);

        // Place locations based on given order
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 2; j++) {
                this.zoneCards[i][j] = this.makeZones(i,j);
                this.zoneCards[i][j].on('clicked', this.clickHandler, this.zoneCards[i][j]);
            }
        }

        // Add dice
        this.dice[0] = this.add.image(495.966, 36.729, "4die");
        this.dice[0].number = this.add.text(491.728, 33.115, "1", { font: '20px Palatino', fill: '#FFFFFF'});
        this.dice[1] = this.add.image(564.837, 37.558, "6die");
        this.dice[1].number = this.add.text(559.421, 28.481, "1", { font: '20px Palatino', fill: '#FFFFFF'});

        //this loop creates all players: self and enemies.
        var count = 0;
        this.nPlayers = this.allPlayersInfo.length;
        for(var i = 0; i < this.nPlayers; i++) {
            if(("private" in this.gameData) && this.allPlayersInfo[i].user_id === this.gameData.private.user_id) {
                this.player = this.makePlayer(this.allPlayersInfo[i].user_id,
                  this.allPlayersInfo[i], i+1);
                this.player.on('clicked', this.clickHandler, this.player);
            }
            else {
                this.otherPlayers[count] = this.makePlayer(this.allPlayersInfo[i].user_id,
                   this.allPlayersInfo[i], i+1);
                this.otherPlayers[count].on('clicked', this.clickHandler, this.otherPlayers[i]);
                count++;
            }
        }

        // adds icon to let players see everything about everyone
        this.gameSummary = this.makeSummary();
        this.gameSummary.on('clicked', this.summaryHandler, this.gameSummary);

        //this is what makes the box appear when character is clicked. See function clickHandler below
        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

        // Only create the aresenal and character card if
        // this user is not a spectator
        if("private" in this.gameData)
        {
            // Add arsenal to screen
            this.num_equip_slots = 6;
            this.add.image(533, 537.5, 'arsenal').setScale(1);

            //create the information box for the bottom left corner
            this.infoBox = this.add.image(104.500, 537.500, 'playerinfo').setScale(1);

            //create the text variables
            var text = this.add.text(10, 450, '', {
                font: '12px Palatino',
                fill: '#FFFFFF',
                wordWrap: { width: 180, useAdvancedWrap: true }
            });
            var name = this.add.bitmapText(68, 477, 'adventur',
                this.charInfo.name,
                size = 16
                );
            name.x = 100 - name.width/2; // center character's name in info box

            //set the text for inside of the box
            text.setText([
                'Team: ' + this.charInfo.alleg,
                'Win Condition: ' + this.charInfo.win_cond_desc,
                'Special Ability: ' + this.charInfo.special_desc
                ]);

            this.add.image(100, 366.975, "circle" + String(this.player.number)).setScale(1.025);
            this.add.image(100, 366.975, this.charInfo.name);
            this.add.image(60.442, 322.289, this.charInfo.name[0]);
            this.add.image(137.489, 412.722, String(this.charInfo.max_damage) + "hp");

            //align the text inside of our information box
            Phaser.Display.Align.In.TopLeft(text, this.add.zone(110, 560, 200, 130));
        }

        // Display reveal button
        $('#reveal').show();

        // Initial update to synchronize spectators
        self.updateBoard(this.gameData.public);

        // Socket receiver for future updates
        socket.on('update', function(data) {
            self.updateBoard(data);
        });

        //socet receiver for displaying stuff
        socket.on('display', function(data) {
            switch(data.type) {
                case "win":
                self.onGameOver(data.winners);
                break;
                case "draw":
                self.onDraw(data);
                break;
                case "reveal":
                self.onReveal(data);
                break;
                case "roll":
                self.onRoll(data);
                break;
                case "die":
                self.onReveal(data);
                break;
                case "damage":
                self.onAttack(data.player);
                break;
                default:
                break;
            }
        });
    },

    makeEquipment: function(card, i) {

            // Add equipment card image
            var equip_x = 265+i*107.450;
            var equip_y = 550;
            var equip = this.add.image(equip_x, equip_y, card.title);


            // Add popup box
            equip.infoBox = this.add.image(equip_x, equip_y - 100, "popup");
            equip.infoBox.setVisible(false);
            equip.infoBox.depth = 30;

            // Add display text
            equip.displayInfo = this.add.text(equip.infoBox.x - 120, equip.infoBox.y - 40, " ", { font: '12px Palatino', fill: '#FFFFFF', wordWrap: { width: 250, useAdvancedWrap: true }});
            equip.displayInfo.setText([
                "Equipment: " + card.title,
                "Effect: " + card.desc
                ]);
            equip.displayInfo.setVisible(false);
            equip.displayInfo.depth = 30;

            // Make clickable
            equip.setInteractive();
            equip.on('clicked', this.clickHandler, equip);
            return equip;
        },

        makeHealthBar: function() {
            var sprite  = this.add.image(960.160, 302.279, 'health');
            sprite.infoBox = this.add.image(800, 175, 'health_popup');
            sprite.infoBox.setVisible(false);
            sprite.infoBox.depth = 30;
            sprite.displayInfo = this.add.text(760, 15, " ", { font: '10px Palatino', fill: '#FFFFFF', wordWrap: { width: 250, useAdvancedWrap: true }});

            sprite.displayInfo.lineSpacing = -2.2;


            var display_text = []
            for (var i = 0; i < this.gameData.public.characters.length; i++) {
              display_text.push("Player: " + this.gameData.public.characters[i].name, "Dies At HP: " + this.gameData.public.characters[i].max_damage + "\n");
          }
          sprite.displayInfo.setText(display_text);
          sprite.displayInfo.setVisible(false);
          sprite.displayInfo.depth = 30;
          sprite.setInteractive();
          return sprite;
      },

    // this adds the zones to the board and makes them interactive on click
    makeZones: function(zone_num, card_num) {
        var zone = this.add.image(this.zoneSpots[zone_num][card_num*2],this.zoneSpots[zone_num][card_num*2 + 1], this.gameData.public.zones[zone_num][card_num].name);
        if (zone_num == 0) {
            zone.setScale(1).angle = -60;
            zone.infoBox = this.add.image(zone.x-90, zone.y, "popup_left");
            zone.displayInfo = this.add.text(zone.infoBox.x - 80, zone.infoBox.y - 40, " ", { font: '12px Palatino', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
        }
        else if (zone_num == 1) {
            zone.setScale(1).angle = 60;
            zone.infoBox = this.add.image(zone.x+90, zone.y, "popup_right");
            zone.displayInfo = this.add.text(zone.infoBox.x - 60, zone.infoBox.y - 40, " ", { font: '12px Palatino', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
        }
        else {
            if(card_num == 0) {
                zone.infoBox = this.add.image(zone.x-90, zone.y, "popup_left");
                zone.displayInfo = this.add.text(zone.infoBox.x - 80, zone.infoBox.y - 40, " ", { font: '12px Palatino', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
            }
            else {
                zone.infoBox = this.add.image(zone.x+90, zone.y, "popup_right");
                zone.displayInfo = this.add.text(zone.infoBox.x - 60, zone.infoBox.y - 40, " ", { font: '12px Palatino', fill: '#FFFFFF', wordWrap: { width: 130, useAdvancedWrap: true }});
            }
        }

        zone.displayInfo.setText([
            "Area: " + this.gameData.public.zones[zone_num][card_num].name,
            this.gameData.public.zones[zone_num][card_num].desc
            ]);

        zone.infoBox.setVisible(false);
        zone.displayInfo.setVisible(false);
        zone.infoBox.depth = 30;
        zone.displayInfo.depth = 30;
        zone.setInteractive();
        return zone;
    },

    // makes summary icon in upper right part of screen interactive
    makeSummary: function() {
      var summaryImg = this.add.image(830, 65, 'summary');
      var summaryIcon = this.add.sprite(820, 83); // Hack to align hitbox with image - phaser is stupid
      summaryIcon.infoBox = this.add.image(516.092, 300, "gameSummary");
      summaryIcon.infoBox.depth = 40;

      summaryIcon.displayInfo = [];
      summaryIcon.displayCharacter = [];
      summaryIcon.names = [];
      summaryIcon.characters = [];
      summaryIcon.damage = [];
      summaryIcon.team = [];
      summaryIcon.win = [];
      summaryIcon.equipment = [];

      //this will be changed later; just making this interactive for testing purposes
      for (var i = 0 ; i < this.nPlayers; i++) {
        if(i%2 == 0) {
            summaryIcon.displayInfo[i] = this.add.text(350.46, 67.18 + 130*(i/2), " ", { font: '10px Palatino', fill: '#000000', wordWrap: { width: 160, useAdvancedWrap: true }});
            summaryIcon.displayCharacter[i] = this.add.image(280.46, 119 + 130*(i/2), "circle" + String(i + 1));
            summaryIcon.displayCharacter[i].charImage = this.add.image(280.46, 119 + 130*(i/2), "Anon");
        }
        else {
            summaryIcon.displayInfo[i] = this.add.text(652.46, 67.18 + 130*((i-1)/2), " ", { font: '10px Palatino', fill: '#000000', wordWrap: { width: 160, useAdvancedWrap: true }});
            summaryIcon.displayCharacter[i] = this.add.image(582.46, 119 + 130*((i-1)/2), "circle" + String(i + 1));
            summaryIcon.displayCharacter[i].charImage = this.add.image(582.46, 119 + 130*((i-1)/2), "Anon");
        }

        summaryIcon.names[i] = this.gameData.public.players[i].user_id;
        summaryIcon.damage[i] = this.gameData.public.players[i].damage;
        summaryIcon.equipment[i] = "None";
        if(this.player && (this.gameData.public.players[i].user_id === this.player.name)) {

          summaryIcon.characters[i] = this.charInfo.name;
          summaryIcon.team[i] = this.charInfo.alleg;
          summaryIcon.win[i] = this.charInfo.win_cond_desc;
          var img_x = summaryIcon.displayCharacter[i].charImage.x;
          var img_y = summaryIcon.displayCharacter[i].charImage.y;
          summaryIcon.displayCharacter[i].charImage.destroy();
          summaryIcon.displayCharacter[i].charImage = this.add.image(img_x, img_y, this.charInfo.name);
      }
      else {
          summaryIcon.characters[i] = "?";
          summaryIcon.team[i] = "?";
          summaryIcon.win[i] = "?";
      }

      summaryIcon.displayInfo[i].setText([
          "Player Name: " + summaryIcon.names[i],
          "Character: " + summaryIcon.characters[i],
          "Damage: " + summaryIcon.damage[i] + ", Team: " + summaryIcon.team[i],
          "Win Condition: " + summaryIcon.win[i],
          "Equipment: " + summaryIcon.equipment[i]
          ]);

      summaryIcon.displayInfo[i].depth = 40;
      summaryIcon.displayCharacter[i].depth = 40;
      summaryIcon.displayCharacter[i].charImage.depth = 40;
      summaryIcon.displayCharacter[i].charImage.setVisible(false);
      summaryIcon.displayInfo[i].setVisible(false);
      summaryIcon.displayCharacter[i].setVisible(false);
  }

  summaryIcon.infoBox.setVisible(false);
  summaryIcon.setInteractive();
  return summaryIcon;
},

    //the makePlayer function is what creates our sprite and adds him to the board.
    makePlayer: function (name, data, num) {
        var sprite = this.add.sprite(this.startSpots[num-1][0], this.startSpots[num-1][1], 'player' + String(num));
        sprite.hpTracker = this.add.image(882 + (24*(num-1)), this.hpStart, 'hpp' + String(num));

        //our player's name
        sprite.name = name;
        sprite.number = num;

        //this is the information that will appear inside of the info box
        sprite.info = data;
        sprite.spots = {};

        var count = 0;

        for(var i = 0; i < 3; i++) {
            sprite.spots[this.gameData.public.zones[i][0].name] = {x: this.allSpots[num-1][count], y: this.allSpots[num-1][count+1]};
            sprite.spots[this.gameData.public.zones[i][1].name] = {x: this.allSpots[num-1][count+2], y: this.allSpots[num-1][count+3]};
            count += 4;
        }

        //this creates the infobox, i.e. the box that will appear when we click on him.
        sprite.infoBox = this.add.image(sprite.x, sprite.y - 65, "popup");
        sprite.infoBox.setVisible(false);
        sprite.displayInfo = this.add.text(sprite.infoBox.x - 120, sprite.infoBox.y - 40, " ", { font: '12px Palatino', fill: '#FFFFFF', wordWrap: { width: 250, useAdvancedWrap: true }});
        sprite.displayInfo.setText([
            "Player: " + sprite.name,
            "Equipment: None"
            ]);
        sprite.displayInfo.setVisible(false);

        //this makes the sprite interactive so that we can click on them
        sprite.setInteractive();
        sprite.depth = 10;
        sprite.infoBox.depth = 20;
        sprite.displayInfo.depth = 20;
        return sprite;
    },

    //updates information about each player
    updatePlayer: function (player, data) {

        // Update name (in case replaced by CPU)
        player.name = data.user_id;

        // Move player
        if(Object.keys(data.location).length != 0) {
            if(!player.info.location.name || player.info.location.name !== data.location.name) {
                player.infoBox.setVisible(false);
                player.displayInfo.setVisible(false);
            }

            if(data.state != 0) {
                var tween = this.tweens.add({
                  targets: player,
                  yoyo: false,
                  x: player.spots[data.location.name].x,
                  y: player.spots[data.location.name].y,
                  duration: 1000,
                  ease: 'Power2',
                  repeat: 0
              });
            }

            // player.x = player.spots[data.location.name].x;
            // player.y = player.spots[data.location.name].y;
            if(player.y-60-45 < 0) {
                player.infoBox.angle = 180;
                player.infoBox.x = player.spots[data.location.name].x;
                player.infoBox.y = player.spots[data.location.name].y + 60;
                player.displayInfo.x = player.infoBox.x - 120;
                player.displayInfo.y = player.infoBox.y - 20;
            }
            else {
                if (player.infoBox.angle != 0) {
                    player.infoBox.angle = 0;
                }
                player.infoBox.x = player.spots[data.location.name].x;
                player.infoBox.y = player.spots[data.location.name].y -60;
                player.displayInfo.x = player.infoBox.x - 120;
                player.displayInfo.y = player.infoBox.y - 40;
            }
        }

        // Update hp
        var tween2 = this.tweens.add({
          targets: player.hpTracker,
          yoyo: false,
          y: this.hpStart - 38.25*data.damage,
          duration: 1000,
          ease: 'Power2',
          repeat: 0
      });

        //player.hpTracker.y = this.hpStart - 38.25*data.damage;
        this.gameSummary.damage[player.number - 1] = data.damage;

        // Kill player if dead
        if(data.state == 0) {
            if (player.infoBox.angle != 0) {
                player.infoBox.angle = 0;
            }
            player.alpha = 0.4;
            player.hpTracker.alpha = 0.4;
            player.infoBox.alpha = 0.4;
            player.displayInfo.alpha = 0.4;
            player.x = this.startSpots[player.number-1][0];
            player.y = this.startSpots[player.number-1][1];
            player.infoBox.x = player.x;
            player.infoBox.y = player.y -60;
            player.displayInfo.x = player.infoBox.x - 120;
            player.displayInfo.y = player.infoBox.y - 40;
        }

        // Update arsenal
        var datasize = data.equipment.length;
        if(this.player && player == this.player) {

            // clear arsenal
            for(var i = 0; i < this.arsenal.length; i++) {
                this.arsenal[i].infoBox.destroy();
                this.arsenal[i].displayInfo.destroy();
                this.arsenal[i].destroy();
            }

            // rebuild arsenal
            this.arsenal = []
            for(var i = 0; i < datasize; i++) {
                this.arsenal[i] = this.makeEquipment(data.equipment[i], i);
            }

            // remove reveal button on person's screen if they are revealed
            if((data.state == 1 || data.state == 0) && $('#reveal').length) {
                $('#reveal').remove();
            }

            // Show special button if person is revealed but hasn't used special
            if((data.state == 1) && !data.special_active) {
                $('#special').show();
            }
            else if((data.state == 0 || data.special_active) && $('#special').length)
            {
                $('#special').remove();
            }
        }

        if((data.state == 1 || data.state == 0) && (player.info.state == 1 || player.info.state == 0) && (!this.player || (this.player.name !== player.name))) {
          if(this.gameSummary.characters[player.number - 1] === "?") {
            this.gameSummary.displayCharacter[player.number - 1].charImage.destroy();
            this.gameSummary.characters[player.number - 1] = data.character.name;
            this.gameSummary.team[player.number - 1] = data.character.alleg;
            this.gameSummary.win[player.number - 1] = data.character.win_cond_desc;
            if ((player.number - 1) % 2 == 0) {
              this.gameSummary.displayCharacter[player.number - 1].charImage = this.add.image(280.46, 119 + 130*((player.number - 1)/2), data.character.name);
          }
          else {
              this.gameSummary.displayCharacter[player.number - 1].charImage = this.add.image(582.46, 119 + 130*((player.number-2)/2), data.character.name);
          }
          this.gameSummary.displayCharacter[player.number - 1].charImage.depth = 40;
          this.gameSummary.displayCharacter[player.number - 1].charImage.setVisible(false);
      }
  }

  if(data.state == 0 && player.info.state != 0) {
      this.gameSummary.characters[player.number - 1] = data.character.name+ " (Dead)";
  }

        // Update player info to contain new data
        player.info = data;

        // Update infobox
        if(Object.keys(player.info.location).length == 0) {
            player.info.location.name = "None";
        }

        var nEquip = player.info.equipment.length;
        if(nEquip == 0) {
            player.info.equipment.list = "None";
            this.gameSummary.equipment[player.number - 1] = "None";
        }
        else {
            player.info.equipment.list = "";
            for(var i = 0; i < nEquip; i++) {
                player.info.equipment.list += player.info.equipment[i].title;
                if(i < nEquip-1) {
                    player.info.equipment.list += ", ";
                }
            }

            this.gameSummary.equipment[player.number - 1] = player.info.equipment.list;
        }

        var displayName = player.name;

        if(player.info.state != 2) {
          displayName += " (" + player.info.character.name + ")";
      }

      player.displayInfo.setText([
        "Player: " + displayName,
        "Equipment: " + player.info.equipment.list
        ]);

      this.gameSummary.displayInfo[player.number - 1].setText([
          "Player Name: " + this.gameSummary.names[player.number - 1],
          "Character: " + this.gameSummary.characters[player.number - 1],
          "Damage: " + this.gameSummary.damage[player.number - 1] + ", Team: " + this.gameSummary.team[player.number - 1],
          "Win Condition: " + this.gameSummary.win[player.number - 1],
          "Equipment: " + this.gameSummary.equipment[player.number - 1]
          ]);
  },

    //for each update, change parts of the board that need to be redrawn.
    updateBoard: function(data) {
        //loop through each player and see if there are things to update
        this.allPlayersInfo = data.players;
        var count = 0;
        for(var i = 0; i < this.nPlayers; i++){
            if(this.player && this.allPlayersInfo[i].user_id === this.player.name) {
                //update self
                this.updatePlayer(this.player, this.allPlayersInfo[i]);
            }
            else {
                //update other players
                this.updatePlayer(this.otherPlayers[count], this.allPlayersInfo[i]);
                count++;
            }
        }
    },
    //if player clicked and box is visible, make invisible. if box is invisible, make visible
    clickHandler: function (player)
    {
        if(player.infoBox.visible == false)
        {
          while(player.scene.openPopups.length > 0) {
            var open = player.scene.openPopups.pop();
            open.infoBox.setVisible(false);
            open.displayInfo.setVisible(false);
        }

        player.infoBox.setVisible(true);
        player.displayInfo.setVisible(true);
        player.scene.openPopups.push(player);
    }
    else
    {
        player.infoBox.setVisible(false);
        player.displayInfo.setVisible(false);
        player.scene.openPopups.pop();
    }
},
    //click handler for popups that will delete them
    cardHandler: function(card)
    {
        card.cardText.visible = false;

        if(card.char) {
            card.charImage.visible = false;
        }

        card.visible = false;
    },

    summaryHandler: function(summary)
    {
        if(summary.infoBox.visible == false)
        {

          summary.infoBox.setVisible(true);

          for(var i = 0; i < summary.scene.nPlayers; i++) {
            summary.displayInfo[i].setVisible(true);
            summary.displayCharacter[i].setVisible(true);
            summary.displayCharacter[i].charImage.setVisible(true);
        }
    }
    else
    {
        summary.infoBox.setVisible(false);
        for(var i = 0; i < summary.scene.nPlayers; i++) {
          summary.displayInfo[i].setVisible(false);
          summary.displayCharacter[i].setVisible(false);
          summary.displayCharacter[i].charImage.setVisible(false);
      }
  }
},

    //game over displays
    onGameOver: function(winners) {
        var nWinners = winners.length;
        this.gameEnd.image = this.add.image(533, 300, "gameOver");
        this.gameEnd.image.depth = 40;
        for(var i = 0; i < nWinners; i++) {
            if(i%2 == 0) {
                this.gameEnd.winners[i] = this.add.image(283, 140 + 130*(i/2), winners[i].character.name);
                this.gameEnd.players_info[i] = this.add.text(352, 78.183 + 130*(i/2), " ", { font: '12px Palatino', fill: '#000000', wordWrap: { width: 160, useAdvancedWrap: true }});
            }
            else {
                this.gameEnd.winners[i] = this.add.image(583, 140 + 130*((i-1)/2), winners[i].character.name);
                this.gameEnd.players_info[i] = this.add.text(652, 78.183 + 130*((i-1)/2), " ", { font: '12px Palatino', fill: '#000000', wordWrap: { width: 160, useAdvancedWrap: true }});
            }
            this.gameEnd.winners[i].depth = 40;
            this.gameEnd.players_info[i].depth = 40;
            this.gameEnd.players_info[i].setText([
                'Player: ' + winners[i].user_id,
                'Character: ' + winners[i].character.name,
                'Team: ' + winners[i].character.alleg,
                'Win Condition: ' + winners[i].character.win_cond_desc
                ]);
        }

        if($('#reveal').length) {
            $('#reveal').remove();
        }

        if($('#special').length) {
            $('#special').remove();
        }
    },

    //drawn card displays
    onDraw: function(cardInfo) {
        var cardsOut = this.cards.nDrawn;

        if(cardInfo.color == "White") {
            this.cards.cardsDrawn[cardsOut] = this.add.image(300, 375, "whitecard");
            this.cards.cardsDrawn[cardsOut].cardText = this.add.text(235, 375, " ", { font: '10px Palatino', fill: '#000000', wordWrap: { width: 139, useAdvancedWrap: true }});
            this.cards.cardsDrawn[cardsOut].charImage = this.add.image(300, 325, cardInfo.title);
        }

        else if (cardInfo.color == "Black") {
            this.cards.cardsDrawn[cardsOut] = this.add.image(300, 375, "blackcard");
            this.cards.cardsDrawn[cardsOut].cardText = this.add.text(235, 375, " ", { font: '10px Palatino', fill: '#FFFFFF', wordWrap: { width: 139, useAdvancedWrap: true }});
            this.cards.cardsDrawn[cardsOut].charImage = this.add.image(300, 325, cardInfo.title);
        }
        else {
            this.cards.cardsDrawn[cardsOut] = this.add.image(300, 375, "greencard");
            this.cards.cardsDrawn[cardsOut].cardText = this.add.text(235, 375, " ", { font: '10px Palatino', fill: '#FFFFFF', wordWrap: { width: 139, useAdvancedWrap: true }});
            this.cards.cardsDrawn[cardsOut].charImage = this.add.image(300, 325, 'Hermit');
        }

        var type = "";

        if(cardInfo.is_equip) {
          type = "Equipment";
      }
      else {
          type = "Single Use";
      }
      this.cards.cardsDrawn[cardsOut].char = true;
      this.cards.cardsDrawn[cardsOut].cardText.setText([
        cardInfo.title,
        type,
        cardInfo.desc
        ]);

      this.cards.cardsDrawn[cardsOut].setInteractive();
      this.cards.cardsDrawn[cardsOut].on('clicked', this.cardHandler, this.cards.cardsDrawn[cardsOut]);
      this.cards.nDrawn = cardsOut + 1;
  },

    //character card displays
    onReveal: function(charInfo) {
        var cardsOut = this.cards.nDrawn;

        this.cards.cardsDrawn[cardsOut] = this.add.image(300, 375, "redcard");
        this.cards.cardsDrawn[cardsOut].char = true;
        this.cards.cardsDrawn[cardsOut].charImage = this.add.image(300, 285, charInfo.player.character.name).setScale(.75);
        this.cards.cardsDrawn[cardsOut].cardText = this.add.text(235, 345, " ", { font: '10px Palatino', fill: '#FFFFFF', wordWrap: { width: 139, useAdvancedWrap: true }});

        this.cards.cardsDrawn[cardsOut].cardText.setText([
            charInfo.player.character.name,
            "Team: " + charInfo.player.character.alleg,
            "Win Condition: " + charInfo.player.character.win_cond_desc,
            "Special Ability: " + charInfo.player.character.special_desc
            ]);

        this.cards.cardsDrawn[cardsOut].setInteractive();
        this.cards.cardsDrawn[cardsOut].on('clicked', this.cardHandler, this.cards.cardsDrawn[cardsOut]);
        this.cards.nDrawn = cardsOut + 1;

        if(!this.player || (this.player.name !== charInfo.player.user_id)) {
          for(var i = 0; i < this.nPlayers; i++) {
            if(charInfo.player.user_id === this.allPlayersInfo[i].user_id) {
              this.gameSummary.characters[i] = charInfo.player.character.name;
              this.gameSummary.team[i] = charInfo.player.character.alleg;
              this.gameSummary.win[i] = charInfo.player.character.win_cond_desc;

              this.gameSummary.displayInfo[i].setText([
                "Player Name: " + this.gameSummary.names[i],
                "Character: " + this.gameSummary.characters[i],
                "Damage: " + this.gameSummary.damage[i] + ", Team: " + this.gameSummary.team[i],
                "Win Condition: " + this.gameSummary.win[i],
                "Equipment: " + this.gameSummary.equipment[i]
                ]);

              this.gameSummary.displayCharacter[i].charImage.destroy();

              if (i % 2 == 0) {
                this.gameSummary.displayCharacter[i].charImage = this.add.image(280.46, 119 + 130*(i/2), charInfo.player.character.name);
            }
            else {
                this.gameSummary.displayCharacter[i].charImage = this.add.image(582.46, 119 + 130*((i-1)/2), charInfo.player.character.name);
            }
            this.gameSummary.displayCharacter[i].charImage.depth = 40;
            this.gameSummary.displayCharacter[i].charImage.setVisible(false);
            break;
        }
    }
}

        // popups
        this.cards.cardsDrawn[cardsOut] = this.add.image(541.58, 215, "alert");
        this.cards.cardsDrawn[cardsOut].cardText = this.add.text(490, 182.5, " ", {
            font: '24px Palatino',
            fill: '#FFFFFF',
            align: "center",
            boundsAlignH: "center",
            boundsAlignV: "middle",
            wordWrap: { useAdvancedWrap: true }
        });

        if(charInfo.type === "die") {
          this.cards.cardsDrawn[cardsOut].cardText.setText([charInfo.player.user_id, "died!"]);
      }
      else {
          this.cards.cardsDrawn[cardsOut].cardText.setText([ charInfo.player.user_id, "revealed!"]);
      }
      this.cards.cardsDrawn[cardsOut].depth = 40;
      this.cards.cardsDrawn[cardsOut].cardText.depth = 40;
      this.cards.cardsDrawn[cardsOut].setInteractive();
      this.cards.cardsDrawn[cardsOut].on('clicked', this.cardHandler, this.cards.cardsDrawn[cardsOut]);
      this.cards.nDrawn = cardsOut + 1;
  },

  onRoll: function(dice) {
      if(dice["4-sided"]) {
        if(dice["6-sided"]) {
          //both dice are present, adjust x and y values for this
          this.dice[0].x = 495.966;
          this.dice[0].number.x = 491.728;

          this.dice[1].x = 564.837;
          this.dice[1].number.x = 559.421;

          //add 6-sided dice to the board
          this.dice[1].number.setVisible(true);
          this.dice[1].setVisible(true);
          this.dice[1].number.setText(dice["6-sided"]);
      }
      else {
          //6 sided is not here
          this.dice[0].x = 529.966;
          this.dice[0].number.x = 524.728;

          //remove 6 sided dice
          this.dice[1].number.setVisible(false);
          this.dice[1].setVisible(false);
      }

        //set 4 sided die
        this.dice[0].number.setVisible(true);
        this.dice[0].setVisible(true);
        this.dice[0].number.setText(dice["4-sided"]);
    }

    else if(dice["6-sided"]){
        //if we get here, then 4-sided is not on the board; remove it
        this.dice[0].number.setVisible(false);
        this.dice[0].setVisible(false);

        //move 6 sided die
        this.dice[1].x = 531.966;
        this.dice[1].number.x = 526.421;

        //set 6 sided die
        this.dice[1].number.setVisible(true);
        this.dice[1].setVisible(true);
        this.dice[1].number.setText(dice["6-sided"]);
    }

    var tween = this.tweens.add({
        targets: [this.dice[0], this.dice[0].number, this.dice[1], this.dice[1].number],
        y: '-=10',
        yoyo: true,
        duration: 100,
        ease: 'Power2',
        repeat: 1
    });

},

onAttack: function(victim) {
  var player;
  var count = 0;
  for(var i = 0; i < this.nPlayers; i++) {
    if(this.otherPlayers[count].name == victim.user_id) {
      player = this.otherPlayers[count];
      break;
  }
  if(this.player.name === victim.user_id) {
      player = this.player;
      break;
  }
  else {
      count++;
  }
}

var tween = this.tweens.add({
    targets: player,
    angle: 70,
    yoyo: true,
    duration: 300,
    ease: 'Power2',
    repeat: 0
});
}
});
