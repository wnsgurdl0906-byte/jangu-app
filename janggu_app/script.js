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
let isGideokTriggered = false; // 기덕 재생 여부 플래그

function updateDisplay(text) {
    soundDisplay.innerText = text;
    soundDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        soundDisplay.style.transform = 'scale(1)';
    }, 100);
}

function handleTouchStart(side) {
    const now = Date.now();
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
            // [개선] 기덕 판정을 터치 시작 시점으로 이동하여 반응성 극대화
            if (now - lastRightTouchTime < 300 && lastRightTouchTime !== 0) {
                isGideokTriggered = true;
                updateDisplay('기덕');
                playSound('gideok');
            }
            
            longPressTimer = setTimeout(() => {
                if (rightPressed && !leftPressed) {
                    wasLongPress = true;
                    updateDisplay('더러러러...');
                    playSound('deoreoreore');
                }
            }, 250);
        }
    }
    // 터치 시작 시점에 시간 기록
    if (side === 'right') {
        lastRightTouchTime = now;
    }
}

function handleTouchEnd(side) {
    const targetElement = side === 'left' ? leftSide : rightSide;
    targetElement.classList.remove('hit');
    
    if (side === 'left') {
        leftPressed = false;
    } else if (side === 'right') {
        clearTimeout(longPressTimer);
        
        if (!isDeong && !leftPressed) {
            if (wasLongPress) {
                // 이미 더러러러 재생됨
            } else if (!isGideokTriggered) {
                // 기덕이 트리거되지 않았을 때만 '덕' 소리 재생
                updateDisplay('덕');
                playSound('deok');
            }
        }
        rightPressed = false;
    }
    isDeong = false;
    isGideokTriggered = false; // 상태 리셋
}

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

leftSide.addEventListener('mousedown', (e) => handleTouchStart('left'));
leftSide.addEventListener('mouseup', (e) => handleTouchEnd('left'));
rightSide.addEventListener('mousedown', (e) => handleTouchStart('right'));
rightSide.addEventListener('mouseup', (e) => handleTouchEnd('right'));
