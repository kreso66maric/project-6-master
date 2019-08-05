    // Start function
    function startAll() {
        startModal.style.display = 'block';
        endModal.style.display = 'none';
        $.playSound('sounds/loop-1.mp3');
        $('.fightButton1').css('display', 'none');
        $('.fightButton2').css('display', 'none');
        $('#fight').css('display', 'none');
        $('#player1-box').addClass('player-turn');
    }

    window.onload = startAll;
    /*============== Object for players =================*/
    // Weapons object
    const weapons =
    [
        {
            name: 'Dagger',
            damage: 15,
            className: 'weapon-1',
            image: 'images/dagger.png'
        },
        {
            name: 'Red Blade',
            damage: 20,
            className: 'weapon-2',
            image: 'images/dagger-two.png'
        },
        {
            name: 'Sword',
            damage: 25,
            className: 'weapon-3',
            image: 'images/sword.png'
        },
        {
            name: 'Hammer',
            damage: 30,
            className: 'weapon-4',
            image: 'images/hammer.png'
        },
        {
            name: 'Staff',
            damage: 35,
            className: 'weapon-5',
            image: 'images/staff.png'
        },
        {
            name: 'Emerald Sword',
            damage: 50,
            className: 'weapon-6',
            image: 'images/emerald.png'
        }
    ];

    // Players object
    const player1 = {
        position: {
            x: 0,
            y: 0
        },
        health: 100,
        hasWeapon: false,
        currentWeapon: weapons[0],
        isDefending: false
    };

    const player2 = {
        position: {
            x: 0,
            y: 0
        },
        health: 100,
        hasWeapon: false,
        currentWeapon: weapons[0],
        isDefending: false
    };

    /*==================== Game ===================*/
    // Random numbers
    const generateRandomNum = () => Math.floor(Math.random() * 10);

    // Game grid
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            $('.grid-container').append('<div class="grid-item" data-y=' + i + ' data-x=' + j + '></div>');

        }
    }
    // Generate elements to display on the grid
    function generate(func, times) {
        for (let i = 0; i < Number(times); i++) {
            func();
        }
    }
    // Function to place items on the grid
    function placeElements(className) {
        const random_x = generateRandomNum();
        const random_y = generateRandomNum();
        $('.grid-item').each(function() {
            const element = $(this);
            if (this.dataset['x'] == random_x && this.dataset['y'] == random_y) {
                if (!(this.classList.contains('unavailable'))) {
                    element.addClass(className);
                    element.addClass('unavailable');
                    // Update position to the player object
                    if (className === 'player-1') {
                        player1.position.x = this.dataset['x'];
                        player1.position.y = this.dataset['y'];
                    } else if (className === 'player-2') {
                        player2.position.x = this.dataset['x'];
                        player2.position.y = this.dataset['y'];
                    } else if (className === 'weapon-1' ||
                                className === 'weapon-2' ||
                                className === 'weapon-3' ||
                                className === 'weapon-4' ||
                                className === 'weapon-5' ||
                                className === 'weapon-6') {
                        element.addClass('weapon');
                    }
                    if (playerEncounter()) {
                        console.log('Early Encounter');
                        playerReset(className);
                        placeElements(className);
                    }
                } else {
                    // Function repeats until it finds space available
                    placeElements(className);
                }
            }
        });
    }

    // Clean the board
    function reset() {
        statReset();
        $('.grid-item').each(function() {
            const element = $(this);
            element.removeClass("block-one");
            element.removeClass("block-two");
            element.removeClass("block-three");
            element.removeClass("weapon");
            element.removeClass("weapon-1");
            element.removeClass("weapon-2");
            element.removeClass("weapon-3");
            element.removeClass("weapon-4");
            element.removeClass("weapon-5");
            element.removeClass("weapon-6");
            element.removeClass("bomb");
            element.removeClass("potion");
            element.removeClass("player-1");
            element.removeClass("player-2");
            element.removeClass("possible");
            element.removeClass("unavailable");
            fightMode = false;
            $('.fightButton1').css('display', 'none');
            $('.fightButton2').css('display', 'none');
            $.stopSound('sounds/loop-2.mp3');
        });
    }

    function generateGame() {
        reset();

        generate(function(){
            placeElements("block-one");
          },4);
          generate(function(){
            placeElements("block-two");
          },4);
          generate(function(){
            placeElements("block-three");
          },4);
          generate(function(){
            placeElements("weapon-2");
          },1);
          generate(function(){
            placeElements("weapon-3");
          },1);
          generate(function(){
            placeElements("weapon-4");
          },1);
          generate(function(){
            placeElements("weapon-5");
          },1);
          generate(function(){
            placeElements("weapon-6");
          },1);
          generate(function(){
            placeElements("bomb");
          },4);
          generate(function(){
            placeElements("potion");
          },2);
          generate(function(){
            placeElements("player-1");
          },1);
          generate(function(){
            placeElements("player-2");
          },1);
          movePlayer(player1);
          movePlayer(player2);
          pathHighlight();
          displayStats(player1);
          displayStats(player2);
          weaponDisplay(player1);
          weaponDisplay(player2);
          statReset();
          $.playSound('sounds/loop-2.mp3');
    }

    // Event handlers
    $('.close').click(generateGame);

    /*================== Movements ===================*/

    let playerTurn = true;

    function pathHighlight() {
        if (!fightMode) {
            if (playerTurn) {
                possiblePath(player1);
            } else {
                possiblePath(player2);
            }
        }
    }

    function movePlayer(player) {
        $('.grid-item').click(function() {
            pathHighlight();
            const element = $(this);
            const block = this;

            // Check if player is within distance
            if (element.hasClass('possible')) {
                if (player === player2) {
                    if (!playerTurn) {
                        weaponChecker(block, player);
                        handleWeapon(element, player);
                        playerReset('player-2');
                        element.addClass('player-2');
                        $('#player1-box').addClass('player-turn');
                        $('#player2-box').removeClass('player-turn');
                        handleFight();
                        playerTurn = !playerTurn;
                        displayStats(player);
                    }
                }
                if (player === player1) {
                    if (playerTurn) {
                        weaponChecker(block, player);
                        handleWeapon(element, player);
                        playerReset('player-1');
                        element.addClass('player-1');
                        $('#player1-box').removeClass('player-turn');
                        $('#player2-box').addClass('player-turn');
                        handleFight();
                        playerTurn = !playerTurn;
                        displayStats(player);
                    }
                }
            }
            pathHighlight();
        });
    }

    function getPlayerPosition() {
        $('.grid-item').each(function() {
            const element = $(this);
            // Takes the coordinates of the players
            if (element.hasClass('player-1')) {
                player1.position.x = this.dataset['x'];
                player1.position.y = this.dataset['y'];
            }
            if (element.hasClass('player-2')) {
                player2.position.x = this.dataset['x'];
                player2.position.y = this.dataset['y'];
            }
        });
    }

    /*============== Handle weapons ==================*/
    function playerReset(player) {
        $('.grid-item').each(function() {
            const element = $(this);
            element.removeClass(player);
            element.removeClass('possible');
        });
    }

    function squareOccupied (element) {
        return (
            element.hasClass('block-one') ||
            element.hasClass('block-two') ||
            element.hasClass('block-three') ||
            element.hasClass('player-1') ||
            element.hasClass('player-2')
        );
    }

    function possiblePath(player) {
        $('.grid-item').each(function() {
            const element = $(this);
            const block = this;
            if (isInDistance(player, block) && !squareOccupied(element)) {
                element.addClass('possible');
            }
        });
        $('.grid-item').each(function() {
            const element = $(this);
            const block = this;

            if(isInDistance(player, block) && (block.dataset['x'] > player.position.x)) {
                if (squareOccupied(element)) {
                    occupiedObject = this;
                    $('.possible').each(function() {
                        const element = $(this);
                        const block = this;
                        if (block.dataset['x'] > occupiedObject.dataset['x']) {
                            element.removeClass('possible');
                        }
                    });
                }
            }

            if (isInDistance(player, block) && (block.dataset['x'] < player.position.x)) {
                if (squareOccupied(element)) {
                    occupiedObject = this;
                    $('.possible').each(function() {
                        const element = $(this);
                        const block = this;
                        if (block.dataset['x'] < occupiedObject.dataset['x']) {
                            element.removeClass('possible');
                        }
                    });
                }
            }

            if (isInDistance(player, block) && (block.dataset['y'] > player.position.y)) {
                if (squareOccupied(element)) {
                    occupiedObject = this;
                    $('.possible').each(function() {
                        const element = $(this);
                            const block = this;
                            if (block.dataset['y'] > occupiedObject.dataset['y']) {
                                element.removeClass('possible');
                            }
                    });
                }
            }

            if(isInDistance(player, block) && (block.dataset['y'] < player.position.y)) {
                if (squareOccupied(element)) {
                    occupiedObject = this;
                    $('.possible').each(function() {
                        const element = $(this);
                        const block = this;
                        if (block.dataset['y'] < occupiedObject.dataset['y']) {
                            element.removeClass('possible');
                        }
                    });
                }
            }
        });
    }

    // Check if all elements are in distance
    // If they have player or block class
    // Movement is not possible
    function isInDistance(player, block) {
        const firstCondition = (Math.abs(block.dataset['x'] - player.position.x) <= 3)
        && (block.dataset['y'] === player.position.y);
        const secondCondition = (Math.abs(block.dataset['y'] - player.position.y) <= 3)
        && (block.dataset['x'] === player.position.x);
        return (firstCondition || secondCondition);
    }

     // Check if there are any weapons in the path
  function weaponChecker(block, player){
    checkSmallerX (block, player);
    checkSmallerY (block, player);
    checkLargerX (block, player);
    checkLargerY (block, player);
  }

  // Check if there is a weapon left of the player
  function checkSmallerX (block, player){
    if (block.dataset['x'] < player.position.x){
      $('.possible').each(function(){
        const element = $(this);
        const innerBlock = this;
        if((innerBlock.dataset['x'] < player.position.x)
          && (innerBlock.dataset['y'] == player.position.y)
          && innerBlock.dataset['x'] > block.dataset['x']){
          if(element.hasClass("weapon") || 
            element.hasClass("bomb") || 
            element.hasClass("potion")){
              weaponChange(element, player);
          }
        }
      })
    }
  }

  // Check if there is a weapon right of the player
  function checkLargerX (block, player) {
    if (block.dataset['x'] > player.position.x){
      $('.possible').each(function(){
        const element = $(this);
        const innerBlock = this;
        if((innerBlock.dataset['x'] > player.position.x)
          && (innerBlock.dataset['y'] == player.position.y)
          && (innerBlock.dataset['x'] < block.dataset['x'])){
          if(element.hasClass("weapon") || 
            element.hasClass("bomb") || 
            element.hasClass("potion")){
              weaponChange(element, player);
          }
        }
      })
    }
  }

  // Check if there is a weapon under the player
  function checkSmallerY (block, player) {
    if (block.dataset['y'] < player.position.y){
      $('.possible').each(function(){
        const element = $(this);
        const innerBlock = this;
        if((innerBlock.dataset['y'] < player.position.y)
          && (innerBlock.dataset['x'] == player.position.x)
          && innerBlock.dataset['y'] > block.dataset['y']){
          if(element.hasClass("weapon") || 
            element.hasClass("bomb") || 
            element.hasClass("potion")){
              weaponChange(element, player);
          }
        }
      })
    }
  }

  // Check if there is a weapon over the player
  function checkLargerY (block, player) {
    if (block.dataset['y'] > player.position.y){
      $('.possible').each(function(){
        const element = $(this);
        const innerBlock = this;
        if((innerBlock.dataset['y'] > player.position.y)
          && (innerBlock.dataset['x'] == player.position.x)
          && innerBlock.dataset['y'] < block.dataset['y']){
          if(element.hasClass("weapon") || 
            element.hasClass("bomb") || 
            element.hasClass("potion")){
              weaponChange(element, player);
          }
        }
      })
    }
  }

      // If there is a weapon, remove the class and replace it with the current one

      function weaponChange (element, player) {
          let playerWeapon = player.currentWeapon;
          if (element.hasClass('weapon-1')) {
              element.removeClass('weapon-1');
              $.playSound('sounds/sound-pickup.mp3');
              element.addClass(playerWeapon.className);
              player.currentWeapon = weapons[0];
              weaponDisplay(player);
          } else if (element.hasClass('weapon-2')) {
              element.removeClass('weapon-2');
              $.playSound('sounds/sound-pickup.mp3');
              element.addClass(playerWeapon.className);
              player.currentWeapon = weapons[1];
              weaponDisplay(player);
          } else if (element.hasClass('weapon-3')) {
              element.removeClass('weapon-3');
              $.playSound('sounds/sound-pickup.mp3');
              element.addClass(playerWeapon.className);
              player.currentWeapon = weapons[2];
              weaponDisplay(player);
          } else if (element.hasClass('weapon-4')) {
              element.removeClass('weapon-4');
              $.playSound('sounds/sound-pickup.mp3');
              element.addClass(playerWeapon.className);
              player.currentWeapon = weapons[3];
              weaponDisplay(player);
          } else if (element.hasClass('weapon-5')) {
              element.removeClass('weapon-5');
              $.playSound('sounds/sound-pickup.mp3');
              element.addClass(playerWeapon.className);
              player.currentWeapon = weapons[4];
              weaponDisplay(player);
          } else if (element.hasClass('weapon-6')) {
            element.removeClass('weapon-6');
            $.playSound('sounds/sound-pickup.mp3');
            element.addClass(playerWeapon.className);
            player.currentWeapon = weapons[5];
            weaponDisplay(player);   
          } else if (element.hasClass('bomb')) {
              player.health -= 15;
              element.removeClass('bomb');
              $.playSound('sounds/sound-bomb.mp3');
          } else if (element.hasClass('potion')) {
              player.health += 20;
              element.removeClass('potion');
              $.playSound('sounds/sound-health.mp3');
          }
      }

      function weaponDisplay(player) {
          if (player === player1) {
              document.getElementById('w-display-1').src = player.currentWeapon.image;
          }
          if (player === player2) {
              document.getElementById('w-display-2').src = player.currentWeapon.image;
          }
      }

      /*============== Fight ===================*/
      let fightMode = false;

      function handleWeapon(element, player) {
          weaponChange(element, player);
      }
      // Player encounter
      function playerEncounter() {
          getPlayerPosition();
          const xPosition = Math.abs(Number(player1.position.x) - Number(player2.position.x));
          const yPosition = Math.abs(Number(player2.position.y) - Number(player1.position.y));
          return (((xPosition == 0) && (yPosition == 1))
          ||
          ((yPosition == 0) && (xPosition == 1))
        )};

        // Handle turns
        function handleFight() {
            if (playerEncounter()) {
                fightMode = true;
                $('.turn').css('display', 'none');
                $('#table').css('display', 'none');
                $('#fight').css('display', 'block');
                $('#game-logo').css('display', 'none');
                $('#reset-btn').css('display', 'none');
                if (playerTurn) {
                    $('.fightButton1').css('display', 'inline-block');
                    $('.fightButton2').css('display', 'none');
                    $('#player1-box').addClass('player-turn');
                    $('#player2-box').removeClass('player-turn');
                }
                if (!playerTurn) {
                    $('.fightButton2').css('display', 'inline-block');
                    $('.fightButton1').css('display', 'none');
                    $('#player2-box').addClass('player-turn');
                    $('#player1-box').removeClass('player-turn');
                }
            }
        }

        // Attacks
        function attackFunc() {
            handleFight();
            if (!playerTurn) {
                if (player2.isDefending) {
                    player2.health = player2.health - (player1.currentWeapon.damage / 2);
                    displayStats(player2);
                } else {
                    player2.health = player2.health - player1.currentWeapon.damage;
                    displayStats(player2);
                }
            } else {
                if (player1.isDefending) {
                    player1.health = player1.health - (player2.currentWeapon.damage / 2);
                    displayStats(player1);
                } else {
                    player1.health = player1.health - player2.currentWeapon.damage;
                    displayStats(player1);
                }
            }
            player1.isDefending = false;
            player2.isDefending = false;
            playerTurn = !playerTurn;
            isGameOver();
        }


        // Defense
            function defendFunc(){
            handleFight();
            if (!playerTurn){
            player1.isDefending = true;
            displayStats(player2);
            } else {
            player2.isDefending = true;
            displayStats(player1);
            }
            playerTurn = !playerTurn;
            isGameOver();
            } 

        // Check if player is out of health
        // Call end screen modal
        function isGameOver() {
            if (player1.health <= 0) {
                player1.health = 0;
                $.stopSound('sounds/loop-3.mp3');
                $.playSound('sounds/loop-5.mp3');
                $('.fightButton1').css('display', 'none');
                $('.fightButton2').css('display', 'none');
                document.getElementById('end-modal').style.display = 'block';
                displayStats(player1);

                // setTimeout(function() {
                    // background.pause();
                    document.getElementById('match-winner').innerHTML = 'Wizard';
                    document.getElementById('winner-gif').src = 'images/wizard-attack.gif';
                    document.getElementById('loser-gif').src = 'images/knight-dead.gif';
                    endModal.style.display = 'block';
                    document.getElementById('end-modal').style.display = 'block';
                // }, 500);
            }
            if (player2.health <=0) {
                player2.health = 0;
                $.stopSound('sounds/loop-3.mp3');
                $.playSound('sounds/loop-5.mp3');
                $('.fightButton1').css('display', 'none');
                $('.fightButton2').css('display', 'none');
                document.getElementById('end-modal').style.display = 'block';
                displayStats(player2);

                // setTimeout(function() {
                    // background.pause();
                    document.getElementById('match-winner').innerHTML = 'Knight';
                    document.getElementById('winner-gif').src = 'images/knight-attack.gif';
                    document.getElementById('loser-gif').src = 'images/wizard-dead.gif';
                    endModal.style.display = 'block';
                    document.getElementById('end-modal').style.display = 'block';
                // }, 500);
            }
        };

        /*================ Player stats update ==================*/
        // Stats
        function displayStats(player) {
            const weapon = player.currentWeapon.name;
            const health = player.health;
            const damage = player.currentWeapon.damage;
            if (player === player1) {
                document.getElementById('player1-weapon').innerHTML = weapon;
                document.getElementById('player1-health').innerHTML = health;
                document.getElementById('player1-damage').innerHTML = damage;
            } else {
                document.getElementById('player2-weapon').innerHTML = weapon;
                document.getElementById('player2-health').innerHTML = health;
                document.getElementById('player2-damage').innerHTML = damage;
            }
        }

        // Reset stats
        function statReset() {
            document.getElementById("player1-weapon").innerHTML = weapons[0].name;
            document.getElementById("player1-damage").innerHTML = weapons[0].damage;
            document.getElementById("player2-weapon").innerHTML = weapons[0].name;
            document.getElementById("player2-damage").innerHTML = weapons[0].damage;
            document.getElementById('w-display-1').src = weapons[0].image;
            document.getElementById('w-display-2').src = weapons[0].image;
        }


        /*============== Modal ==================*/
        const table = document.querySelector('.table');
        const load = document.getElementById('load');

        const startModal = document.getElementById('start-modal');
        const startBtn = document.getElementsByClassName('close')[0];
        startBtn.onclick = function() {
            startModal.style.display = 'none';
        }

         /*----- End Modal -----*/
        const endModal = document.getElementById('end-modal');
        const rematchBtn = document.getElementsByClassName("rematch")[0];
        rematchBtn.onclick = function() {
        document.location.reload();
        }

        /*=========== Attack and defend buttons ==============*/
        // Attack
        const attackBtn1 = document.getElementById('attack1');
        const attackBtn2 = document.getElementById('attack2');
        attackBtn1.onclick = function() {
            $.playSound('sounds/sound-attack.mp3');
            attackFunc();
        }
        attackBtn2.onclick = function() {
            $.playSound('sounds/sound-attack.mp3');
            attackFunc();
        }

        // Defend
        const defendBtn1 = document.getElementById('defend1');
        const defendBtn2 = document.getElementById('defend2');
        defendBtn1.onclick = function() {
            $.playSound('sounds/sound-defence.mp3');
            defendFunc();
        }
        defendBtn2.onclick = function() {
            $.playSound('sounds/sound-defence.mp3');
            defendFunc();
        }

        // Reset
        $('#reset-btn').on('click', function() {
            generateGame();
        });


  /************ Rules button modal *****************/
  let rulesModal = $('#rules-modal');
  let modalBtn = $('#rules-btn');
  let closeBtn = $('#close-btn');
  
  // Listen for open click
  modalBtn.on('click', function() {
    rulesModal.css('display', 'block');
    $.playSound('sounds/sound-page.mp3');
  });
  // Listen for close click
  closeBtn.on('click', function() {
    rulesModal.css('display', 'none');
    $.playSound('sounds/sound-page-close.mp3');
  });