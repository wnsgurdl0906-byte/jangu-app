const soundDisplay = document.getElementById('sound-//display'); // Fix potential ID mismatch
const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');

// 로컬 파일(file://)과 웹(https://) 모두에서 완벽하게 작동하는 오디오 풀 시스템
class AudioPool {
    constructor(url, poolSize = 10) {
        this.pool = [];
        this.currentIndex = 0;
        for (let i = 0; i < poolSize; i++) {
            const audio = new Audio(url);
            audio.preload = 'auto';
            this.pool.push(audio);
        }
    }

    play() {
        const sound = this.pool[this.currentIndex];
        sound.currentTime = 0; // 즉시 처음부터 재생하여 딜레이 제거
        sound.play().catch(e => console.log("재생 에러:", e));
        this.currentIndex = (this.currentIndex + 1) % this.pool.length;
    }
}

// 사운드 풀 설정 - 상대 경로 사용
const sounds = {
    deong: new AudioPool('sounds/deong.mp3'),
    gideok: new AudioPool('sounds/gideok.mp3'),
    kung: new AudioPool('sounds/kung.mp3'),
    deoreoreore: new AudioPool('sounds/deoreoreore.mp3'),
    deok: new AudioPool('sounds/deok.mp3')
};

// display element reference correction
const display = document.getElementById('sound-display');

let leftDown = false;
let rightDown = false;
let lastRightDown = 0;
let longPressTimer = null;
let isDeongActive = false;
let isLongPressActive = false;

function updateDisplay(text) {
    if (display && display.innerText !== text) {
        display.innerText = text;
    }
}

function handleStart(side) {
    const el = side === 'left' ? leftSide : rightSide;
    el.classList.add('hit');
    
    if (side === 'left') {
        leftDown = true;
        if (rightDown) {
            isDeongActive = true;
            updateDisplay('덩!');
            sounds.deong.play();
        } else {
            updateDisplay('쿵');
            sounds.kung.play();
        }
    } else {
        rightDown = true;
        isLongPressActive = false;
        if (leftDown) {
            isDeongActive = true;
            updateDisplay('덩!');
            sounds.deong.play();
        } else {
            const now = Date.now();
            if (now - lastRightDown < 300) {
                updateDisplay('기덕');
                sounds.gideok.play();
                isDeongActive = true;
            }
            lastRightDown = now;
            longPressTimer = setTimeout(() => {
                if (rightDown && !leftDown) {
                    isLongPressActive = true;
                    updateDisplay('더러러러...');
                    sounds.deoreoreore.play();
                }
            }, 250);
        }
    }
}

function handleEnd(side) {
    const el = side === 'left' ? leftSide : rightSide;
    el.classList.remove('hit');
    if (side === 'left') {
        leftDown = false;
    } else {
        clearTimeout(longPressTimer);
        if (!isDeongActive && !leftDown && !isLongPressActive) {
            updateDisplay('덕');
            sounds.deok.play();
        }
        rightDown = false;
    }
    isDeongActive = false;
}

// 이벤트 바인딩
leftSide.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart('left'); }, { passive: false });
leftSide.addEventListener('touchend', (e) => { e.preventDefault(); handleEnd('left'); }, { passive: false });
rightSide.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart('right'); }, { passive: false });
rightSide.addEventListener('touchend', (e) => { e.preventDefault(); handleEnd('right'); }, { passive: false });

leftSide.addEventListener('mousedown', () => handleStart('left'));
leftSide.addEventListener('mouseup', () => handleEnd('left'));
rightSide.addEventListener('mousedown', () => handleStart('right'));
rightSide.addEventListener('mouseup', () => handleEnd('right'));
