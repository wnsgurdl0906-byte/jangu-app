const soundDisplay = document.getElementById('sound-display');
const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');

// 소리 파일 경로 설정
const SOUND_PATHS = {
    deong: 'sounds/deong.mp3',
    gideok: 'sounds/gideok.mp3',
    kung: 'sounds/kung.mp3',
    deoreoreore: 'sounds/deoreoreore.mp3',
    deok: 'sounds/deok.mp3'
};

// [핵심] 매번 새로운 오디오 객체를 생성하여 절대 겹치지 않게 재생
function playSound(soundKey) {
    const path = SOUND_PATHS[soundKey];
    if (!path) return;

    const audio = new Audio(path);
    audio.play().catch(e => console.log("재생 에러:", e));
}

let leftPressed = false;
let rightPressed = false;
let lastRightTouchTime = 0;
let longPressTimer = null;
let isDeong = false;
let wasLongPress = false;

function updateDisplay(text) {
    soundDisplay.innerText = text;
    soundDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        soundDisplay.style.transform = 'scale(1)';
    }, 100);
}

function handleTouchStart(side) {
    const targetElement = side === 'left' ? leftSide : rightSide;
    targetElement.classList.add('hit');
    
    if (side === 'left') {
        leftPressed = true;
        if (rightPressed) {
            isDeong = true;
            updateDisplay('덩!');
            playSound('deong');
        } else {
            updateDisplay('쿵');
            playSound('kung');
        }
    } else if (side === 'right') {
        rightPressed = true;
        wasLongPress = false;
        
        if (leftPressed) {
            isDeong = true;
            updateDisplay('덩!');
            playSound('deong');
        } else {
            longPressTimer = setTimeout(() => {
                if (rightPressed && !leftPressed) {
                    wasLongPress = true;
                    updateDisplay('더러러러...');
                    playSound('deoreoreore');
                }
            }, 250);
        }
    }
}

function handleTouchEnd(side) {
    const targetElement = side === 'left' ? leftSide : rightSide;
    targetElement.classList.remove('hit');
    
    if (side === 'left') {
        leftPressed = false;
    } else if (side === 'right') {
        clearTimeout(longPressTimer);
        const now = Date.now();
        
        if (!isDeong && !leftPressed) {
            if (wasLongPress) {
                // 더러러러는 이미 재생됨
            } else if (now - lastRightTouchTime < 300 && now !== lastRightTouchTime) {
                updateDisplay('기덕');
                playSound('gideok');
            } else {
                updateDisplay('덕');
                playSound('deok');
            }
        }
        lastRightTouchTime = now;
        rightPressed = false;
    }
    isDeong = false;
}

// 모바일 터치 중복 방지 및 기본 동작 차단
leftSide.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleTouchStart('left');
}, { passive: false });

leftSide.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleTouchEnd('left');
}, { passive: false });

rightSide.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleTouchStart('right');
}, { passive: false });

rightSide.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleTouchEnd('right');
}, { passive: false });

// PC 마우스 테스트용
leftSide.addEventListener('mousedown', (e) => handleTouchStart('left'));
leftSide.addEventListener('mouseup', (e) => handleTouchEnd('left'));
rightSide.addEventListener('mousedown', (e) => handleTouchStart('right'));
rightSide.addEventListener('mouseup', (e) => handleTouchEnd('right'));
