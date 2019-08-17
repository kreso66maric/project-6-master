function startAll() {
    startModal.style.display = 'block';
    endModal.style.display = 'none';
    $.playSound('sounds/loop-1.mp3');
    $('.fightButton1').hide();
    $('.fightButton2').hide();
    $('#fight').hide();
    $('#player1-box').addClass('player-turn');
    $('#defend-shield').hide();
}
/*============== Object for players =================*/
// Weapons object
const weapons = [{
        name: 'Dagger',
        damage: 20,
        className: 'weapon-1',
        image: 'images/dagger.png'
    },
    {
        name: 'Red Blade',
        damage: 25,
        className: 'weapon-2',
        image: 'images/dagger-two.png'
    },
    {
        name: 'Sword',
        damage: 30,
        className: 'weapon-3',
        image: 'images/sword.png'
    },
    {
        name: 'Hammer',
        damage: 35,
        className: 'weapon-4',
        image: 'images/hammer.png'
    },
    {
        name: 'Staff',
        damage: 40,
        className: 'weapon-5',
        image: 'images/staff.png'
    },
];

// Players object
const player1 = {
    position: {
        x: 0,
        y: 0
    },
    health: 100,
    currentWeapon: weapons[0],
    clickCount: 0
};

const player2 = {
    position: {
        x: 0,
        y: 0
    },
    health: 100,
    currentWeapon: weapons[0],
    clickCount: 0
};

/*==================== Game ===================*/
let playerTurn = true;
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
function placeItems(className) {
    const random_x = Math.floor(Math.random() * 10);
    const random_y = Math.floor(Math.random() * 10);
    $('.grid-item').each(function() {
        if (this.dataset['x'] == random_x && this.dataset['y'] == random_y) {
            if (!(this.classList.contains('unavailable'))) {
                $(this).addClass(className);
                $(this).addClass('unavailable');
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
                    className === 'weapon-5') {
                    $(this).addClass('weapon');
                }
                if (playerEncounter()) {
                    playerReset(className);
                    placeItems(className);
                }
            } else {
                // Function repeats until it finds space available
                placeItems(className);
            }
        }
    });
}

// Clean the board
function reset() {
    statsReset();
    $('.grid-item').each(function() {
        const element = $(this);
        element.removeClass('block-one');
        element.removeClass('block-two');
        element.removeClass('block-three');
        element.removeClass('weapon');
        element.removeClass('weapon-1');
        element.removeClass('weapon-2');
        element.removeClass('weapon-3');
        element.removeClass('weapon-4');
        element.removeClass('weapon-5');
        element.removeClass('bomb');
        element.removeClass('potion');
        element.removeClass('player-1');
        element.removeClass('player-2');
        element.removeClass('possible');
        element.removeClass('unavailable');
        fightMode = false;
    });
    player1.currentWeapon = weapons[0];
    player2.currentWeapon = weapons[0];
    player1.health = 100;
    player2.health = 100;
}

$('.close').click(function() {
    generateGame();
});

function generateGame() {
    reset();

    generate(function() {
        placeItems('block-one');
    }, 4);
    generate(function() {
        placeItems('block-two');
    }, 4);
    generate(function() {
        placeItems('block-three');
    }, 4);
    generate(function() {
        placeItems('weapon-2');
    }, 1);
    generate(function() {
        placeItems('weapon-3');
    }, 1);
    generate(function() {
        placeItems('weapon-4');
    }, 1);
    generate(function() {
        placeItems('weapon-5');
    }, 1);
    generate(function() {
        placeItems('bomb');
    }, 4);
    generate(function() {
        placeItems('potion');
    }, 2)
    generate(function() {
        placeItems('player-1');
    }, 1);
    generate(function() {
        placeItems('player-2');
    }, 1);
    movePlayer(player1);
    movePlayer(player2);
    pathHighlight();
    displayStats(player1);
    displayStats(player2);
    weaponDisplay(player1);
    weaponDisplay(player2);
    statsReset();
}

// Event handlers
$('.close').click(generateGame);

/*================== Movements ===================*/

function pathHighlight() {
    if (playerTurn) {
        possiblePath(player1);
    } else {
        possiblePath(player2);
    }
}

function movePlayer(player) {
    $('.grid-item').click(function() {
        pathHighlight();
        const element = $(this);
        const block = this;

        // Check if player is within distance
        if ($(this).hasClass('possible')) {
            if (player === player2) {
                if (!playerTurn) {
                    weaponChecker(block, player);
                    weaponChange(element, player);
                    playerReset('player-2');
                    $(this).addClass('player-2');
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
                    weaponChange(element, player);
                    $('#player1-box').removeClass('player-turn');
                    $('#player2-box').addClass('player-turn');
                    playerReset('player-1');
                    $(this).addClass('player-1');
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

function squareOccupied(element) {
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

        if (isInDistance(player, block) && (block.dataset['x'] > player.position.x)) {
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

        if (isInDistance(player, block) && (block.dataset['y'] < player.position.y)) {
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
    const firstCondition = (Math.abs(block.dataset['x'] - player.position.x) <= 3) && (block.dataset['y'] === player.position.y);
    const secondCondition = (Math.abs(block.dataset['y'] - player.position.y) <= 3) && (block.dataset['x'] === player.position.x);
    return (firstCondition || secondCondition);
}

// Check if there are any weapons in the path
function weaponChecker(block, player) {
    checkWeaponLeft(block, player);
    checkWeaponUnder(block, player);
    checkWeaponRight(block, player);
    checkWeaponOver(block, player);
}

// Check if there is a weapon left of the player
function checkWeaponLeft(block, player) {
    if (block.dataset['x'] < player.position.x) {
        $('.possible').each(function() {
            const element = $(this);
            const innerBlock = this;
            if ((innerBlock.dataset['x'] < player.position.x) &&
                (innerBlock.dataset['y'] == player.position.y) &&
                innerBlock.dataset['x'] > block.dataset['x']) {
                if (element.hasClass('weapon') || element.hasClass('bomb') || element.hasClass('potion')) {
                    weaponChange(element, player);
                }
            }
        });
    }
}

// Check if there is a weapon right of the player
function checkWeaponRight(block, player) {
    if (block.dataset['x'] > player.position.x) {
        $('.possible').each(function() {
            const element = $(this);
            const innerBlock = this;
            if ((innerBlock.dataset['x'] > player.position.x) &&
                (innerBlock.dataset['y'] == player.position.y) &&
                (innerBlock.dataset['x'] < block.dataset['x'])) {
                if (element.hasClass('weapon') || element.hasClass('bomb') || element.hasClass('potion')) {
                    weaponChange(element, player);
                }
            }
        });
    }
}

// Check if there is a weapon under the player
function checkWeaponUnder(block, player) {
    if (block.dataset['y'] < player.position.y) {
        $('.possible').each(function() {
            const element = $(this);
            const innerBlock = this;
            if ((innerBlock.dataset['y'] < player.position.y) &&
                (innerBlock.dataset['x'] == player.position.x) &&
                innerBlock.dataset['y'] > block.dataset['y']) {
                if (element.hasClass('weapon') || element.hasClass('bomb') || element.hasClass('potion')) {
                    weaponChange(element, player);
                }
            }
        });
    }
}


// Check if there is a weapon over the player
function checkWeaponOver(block, player) {
    if (block.dataset['y'] > player.position.y) {
        $('.possible').each(function() {
            const element = $(this);
            const innerBlock = this;
            if ((innerBlock.dataset['y'] > player.position.y) &&
                (innerBlock.dataset['x'] == player.position.x) &&
                innerBlock.dataset['y'] < block.dataset['y']) {
                if (element.hasClass('weapon') || element.hasClass('bomb') || element.hasClass('potion')) {
                    weaponChange(element, player);
                }
            }
        });
    }
}

// If there is a weapon, remove the class and replace it with the current one
function weaponChange(element, player) {
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
    } else if (element.hasClass('bomb')) {
        player.health -= 15;
        element.removeClass('bomb');
        $.playSound('sounds/sound-bomb.mp3');
    } else if (element.hasClass('potion')) {
        player.health += 15;
        element.removeClass('potion');
        $.playSound('sounds/sound-health.mp3');
    }
}

// Player encounter
function playerEncounter() {
    getPlayerPosition();
    const xPosition = Math.abs(Number(player1.position.x) - Number(player2.position.x));
    const yPosition = Math.abs(Number(player2.position.y) - Number(player1.position.y));
    return ((xPosition == 0) && (yPosition == 1)) || ((yPosition == 0) && (xPosition == 1))
};

/*=============== Player stats display ==================*/
function weaponDisplay() {
    if (player1) {
        document.getElementById('w-display-1').src = player1.currentWeapon.image;
    }
    if (player2) {
        document.getElementById('w-display-2').src = player2.currentWeapon.image;
    }
}

function displayStats(player) {
    if (player === player1) {
        document.getElementById('player1-weapon').innerHTML = player.currentWeapon.name;
        document.getElementById('player1-health').innerHTML = player.health;
        document.getElementById('player1-damage').innerHTML = player.currentWeapon.damage;
    } else {
        document.getElementById('player2-weapon').innerHTML = player.currentWeapon.name;
        document.getElementById('player2-health').innerHTML = player.health;
        document.getElementById('player2-damage').innerHTML = player.currentWeapon.damage;
    }
}

function statsReset() {
    document.getElementById("player1-weapon").innerHTML = weapons[0].name;
    document.getElementById("player1-damage").innerHTML = weapons[0].damage;
    document.getElementById("player2-weapon").innerHTML = weapons[0].name;
    document.getElementById("player2-damage").innerHTML = weapons[0].damage;
    document.getElementById('w-display-1').src = weapons[0].image;
    document.getElementById('w-display-2').src = weapons[0].image;
}

$('#reset-btn').on('click', function() {
    generateGame();
});

// Handle fight mode
function handleFight() {
    if (playerEncounter()) {
        $('#table').hide();
        $('#game-logo').hide();
        $('#reset-btn').hide();
        $('#fight').show();

        if (playerTurn) {
            $('.fightButton1').css('display', 'inline-block');
            $('.fightButton2').hide();
            $('#player1-box').addClass('player-turn');
            $('#player2-box').removeClass('player-turn');
        }
        if (!playerTurn) {
            $('.fightButton1').hide();
            $('.fightButton2').css('display', 'inline-block');
            $('#player2-box').addClass('player-turn');
            $('#player1-box').removeClass('player-turn');
        }
    }
};


// Attacks
function attackFunc() {
    handleFight();
    if (!playerTurn) {
        if (player2.isDefending) {
            player2.health = player2.health - (player1.currentWeapon.damage / 2);
            console.log(player2.health);
            displayStats(player2);
        } else {
            player2.health = player2.health - player1.currentWeapon.damage;
            displayStats(player2);
        }
    } else {
        if (player1.isDefending) {
            player1.health = player1.health - (player2.currentWeapon.damage / 2);
            console.log(player1.health);
            displayStats(player1);
        } else {
            player1.health = player1.health - player2.currentWeapon.damage;
            displayStats(player1);
        }
    }
    player1.isDefending = false;
    player2.isDefending = false;
    playerTurn = !playerTurn;
    gameOver();
}


// Defense
    function defendFunc(){
        let defendShield = document.getElementById('defend-shield');
        handleFight();
        if (!playerTurn){
            player1.isDefending = true;
            defendShield.src = 'images/shield.png';
            defendShield.setAttribute('style', 'transform: rotateY(180deg)');
            displayStats(player2);
        } else {
            player2.isDefending = true;
            defendShield.src = 'images/shield.png';
            defendShield.removeAttribute('style', 'transform:rotateY(180deg)');
            displayStats(player1);
        }
        playerTurn = !playerTurn;
        gameOver();
    } 

    
    function checkDefendCount(player) {
           player.clickCount++;
           if (player.clickCount > 1) {
                $('#defend-shield').hide();
                $('.defend-message').css('display', 'block');
                setTimeout(function() {
                    $('.defend-message').css('display', 'none');
                    player.clickCount = 0;
                }, 1500);
           }
    }

function gameOver() {
    if (player1.health <= 0) {
        $.playSound('sounds/loop-2.mp3');
        $.stopSound('sounds/loop-1.mp3');
        $('.fightButton1').hide();
        $('.fightButton2').hide();
        $('#end-modal').show();

        document.getElementById('match-winner').innerText = 'Wizard';
        document.getElementById('winner-gif').src = 'images/wizard-attack.gif';
        document.getElementById('loser-gif').src = 'images/knight-dead.gif';
    }
    if (player2.health <= 0) {
        $.playSound('sounds/loop-2.mp3');
        $.stopSound('sounds/loop-1.mp3');
        $('.fight-button1').hide();
        $('.fight-button2').hide();
        $('#end-modal').show();

        document.getElementById('match-winner').innerText = 'Knight';
        document.getElementById('winner-gif').src = 'images/knight-attack.gif';
        document.getElementById('loser-gif').src = 'images/wizard-dead.gif';
    }
}

/*=========== Attack and defend buttons ==============*/
// Attack
$('#attack1').on('click', function() {
    $('#defend-shield').hide();
    $.playSound('sounds/sound-attack.mp3');
    attackFunc();
    player1.clickCount = 0;
});
$('#attack2').on('click', function() {
    $('#defend-shield').hide();
    $.playSound('sounds/sound-attack.mp3');
    attackFunc();
    player2.clickCount = 0;
});

// Defend
$('#defend1').on('click', function() {
    $.playSound('sounds/sound-defence.mp3');
    defendFunc();
    checkDefendCount(player1);
});
$('#defend2').on('click', function() {
    $.playSound('sounds/sound-defence.mp3');
    defendFunc();
    checkDefendCount(player2);
});

/*============== Modal ==================*/
const table = document.querySelector('.table');
const load = document.getElementById('load');

const startModal = document.getElementById('start-modal');
const startBtn = document.getElementsByClassName('close')[0];
startBtn.onclick = function() {
    startModal.style.display = 'none';
};

/*----- End Modal -----*/
const endModal = document.getElementById('end-modal');
const rematchBtn = document.getElementsByClassName('rematch')[0];
rematchBtn.onclick = function() {
    document.location.reload();
};

/************ Rules button modal *****************/
let rulesModal = $('#rules-modal');
let modalBtn = $('#rules-btn');
let closeBtn = $('#close-btn');

// Listen for open click
modalBtn.on('click', function() {
    rulesModal.show();
    $('#game').hide();
    $.playSound('sounds/sound-page.mp3');
});
// Listen for close click
closeBtn.on('click', function() {
    rulesModal.hide();
    $('#game').show();
    $.playSound('sounds/sound-page-close.mp3');
});


startAll();