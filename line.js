c = canvas.getContext('2d');
MAX = 24;

onload = function update() {

    requestAnimationFrame(update);

    // init
    if (!window.time) {
        time = 0;
        frame = 0;
        timeNextFrame = 0;
        vines = [{
            x: 0,
            y: 0,
            a: 0,
            ai: 0,
            w: 8,
            p: [],
            l: MAX * 60
        }];
        noteIndex = 0;
        notesFreq = [155, 195, 261, 155, 233, 155, 195, 207, 195,
            207, 195, 207, 195, 207, 195, 261, 155, 233, 155, 233, 261,
            155, 233, 155, 233, 155, 233, 261, 155, 195, 261, 195, 207,
            195, 261, 155, 233, 155, 233, 155, 195, 207, 233, 155, 233,
            155, 195, 207, 195, 207, 233, 261, 155, 233, 261, 233, 261,
            155, 195, 207, 195, 207, 195, 207, 195, 261, 233, 155, 195,
            207, 233, 261, 233, 155, 233, 261, 155, 195, 207, 195, 261,
            155, 233, 261, 155, 233, 261, 195, 261, 233, 261, 155, 233,
            155, 195, 207, 233, 261, 233, 155, 195, 261, 233, 155, 195,
            261, 195, 261, 155, 233, 261, 195, 207, 233, 261, 195, 207,
            195, 261, 233, 155, 195, 261, 155, 195, 207, 195, 261];
        str = '';
        s = !audio.src;
    }

    // time update
    currentTime = s ? MAX : audio.currentTime;
    while (time < currentTime) {
        while (time < timeNextFrame) {
            if (s) {
                frac = (time & 8 ?  time * 6 : time / 4) % 1;
                noteIndex += frac === 0;
                v = (time * notesFreq[noteIndex & 127] % 1) * (1 - frac) * (32 + 8 * Math.sin(time));
                v += Math.sin(time * notesFreq[time >> 2] * Math.PI * 2) * 24;

                str += String.fromCharCode(v + 127);
            }
            time += 1 / 16384;
        }

        frame++;
        timeNextFrame += 1 / 60;

        // update visuals
        vines = vines.filter(v => v.l--);
        vines.forEach(v => {
            dx = Math.cos(v.a) * v.w / 2;
            dy = Math.sin(v.a) * v.w / 2;

            v.x += dx;
            v.y += dy;
            v.a += v.ai / v.w / 2;
            v.p.splice(0, v.p.length - v.l);
            v.p.splice(0, v.p.length - 60 * 5);
            v.p.push({
                x: v.x,
                y: v.y,
                dx: dx,
                dy: dy
            });

            if (frame % 30 == 0) {
                v.ai = Math.random() - 0.5;
            }

            if (v.w > 1 && Math.random () < v.l / 16384 / 2) {
                vines.push({
                    x: v.x,
                    y: v.y,
                    a: v.a,
                    ai: v.ai,
                    w: v.w / 2,
                    p: [],
                    l: Math.min(v.l, 0 | v.w * 32 * (1 + Math.random()))
                });
            }
        });
    }

    if (s) {
        audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAA' + 'EAAAABA' + 'AAABAAgAZGF0YQAAAAAA' + btoa(str);
        audio.play();
        time = 0;
    } else {
        //render visual
        H = canvas.height = 512;
        W = canvas.width = 0 | H * innerWidth / innerHeight;

        c.translate(W / 2, H / 2);
        c.shadowBlur = 24;

        vines.forEach(v => {
            c.shadowColor = 'hsl(' + (v.a * 60 | 0) + ', 100%, ' + (60 + v.w * 5) + '%)';
            c.strokeStyle = 'hsl(' + (v.a * 60 | 0) + ', 100%, ' + (60 + v.w * 5) + '%)';

            if (v.w == 8) {
                c.translate(-v.x, -v.y);
            }

            c.beginPath();

            l = v.p.length - 1;

            for (i = l; p = v.p[i]; i -= 8) {
                e = i / l * 8;
                c.moveTo(p.x, p.y);
                c.lineTo(p.x - e * p.dx, p.y - e * p.dy);
            }
            c.stroke();
        });
    }
};
