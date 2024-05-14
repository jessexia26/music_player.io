(function() {
  var AUDIO_URL, TOTAL_BANDS, analyser, analyserDataArray, arrCircles, audio, build, buildCircles, canplay, changeSong,changeMode, changeTheme, circlesContainer, cp, createCircleTex, gui, hammertime, init, initAudio, initGUI, initGestures, isPlaying, k, message, modes, mousePt, mouseX, mouseY, params, play, renderer, resize, stage, startAnimation, texCircle, themes, themesNames, songs, songsNames,update, v, windowH, windowW;
  songs = {
      "折梦影": "./music/折梦影.mp3",
      "橘色星球": "./music/橘色星球.mp3",
      "良宵异彩": "./music/良宵异彩.mp3",
      "碧空澈明": "./music/碧空澈明.mp3",
  };
  songsNames = [];

  for (k in songs) {
    v = songs[k];
    songsNames.push(k);
  }
  AUDIO_URL = "./music/良宵异彩.mp3";

  modes = ["cubic", "conic"];

  themes = {
    pinkBlue: [0xFF0032, 0xFF5C00, 0x00FFB8, 0x53FF00],
    yellowGreen: [0xF7F6AF, 0x9BD6A3, 0x4E8264, 0x1C2124, 0xD62822],
    yellowRed: [0xECD078, 0xD95B43, 0xC02942, 0x542437, 0x53777A],
    blueGray: [0x343838, 0x005F6B, 0x008C9E, 0x00B4CC, 0x00DFFC],
    blackWhite: [0xFFFFFF, 0x000000, 0xFFFFFF, 0x000000, 0xFFFFFF]
  };

  themesNames = [];

  for (k in themes) {
    v = themes[k];
    themesNames.push(k);
  }

  // PARAMETERS
  params = {
    // public
    mode: modes[0],
    theme: themesNames[0],
    song: songsNames[0],
    radius: 3,
    distance: 600,
    size: .5,
    // private
    numParticles: 5000,
    sizeW: 1,
    sizeH: 1,
    radiusParticle: 60,
    themeArr: themes[this.theme],
    songArr: songs[this.song]
  };

  TOTAL_BANDS = 256;

  cp = new PIXI.Point();

  mouseX = 0;

  mouseY = 0;

  mousePt = new PIXI.Point();

  windowW = 0;

  windowH = 0;

  stage = null;

  renderer = null;

  texCircle = null;

  circlesContainer = null;

  arrCircles = [];

  hammertime = null;

  message = null;

  // audio
  audio = null;

  analyser = null;

  analyserDataArray = null;

  isPlaying = false;

  canplay = false;

  // gui
  gui = null;

  init = function() {
    initGestures();
    message = $(".message");
    message.on("click", play);
    resize();
    build();
    resize();
    mousePt.x = cp.x;
    mousePt.y = cp.y;
    $(window).resize(resize);
    startAnimation();
    return initGUI();
  };

  play = function() {
    if (isPlaying) {
      return;
    }
    initAudio();
    message.css("cursor", "default");
    if (canplay) {
      message.hide();
    } else {
      message.html("LOADING MUSIC...");
    }
    audio.play();
    return isPlaying = true;
  };

  initGUI = function() {
    var modeController, sizeController, themeController, songController;
    gui = new dat.GUI();
    // if window.innerWidth < 500
    gui.close();
    songController = gui.add(params,'song', songsNames);
    songController.onChange(function(value) {
      return changeSong(params.song);
    });
    modeController = gui.add(params, 'mode', modes);
    modeController.onChange(function(value) {
      return changeMode(value);
    });
    themeController = gui.add(params, 'theme', themesNames);
    themeController.onChange(function(value) {
      return changeTheme(params.theme);
    });
    gui.add(params, 'radius', 1, 8);
    gui.add(params, 'distance', 100, 1000);
    sizeController = gui.add(params, 'size', 0, 1);
    return sizeController.onChange(function(value) {
      return resize(value);
    });
  };
  stop = function() {
    if (!isPlaying) {
      return;
    }
    audio.pause();
    audio.currentTime = 0; // 重置音频播放位置为开始
    isPlaying = false;
    message.show().html("点击播放音乐");
    message.css("cursor", "pointer");
  };
  changeSong = function(newTrack) {
    params.songArr = songs[newTrack];
    newTrackURL = params.songArr;
    if (isPlaying) {
      stop(); // 停止当前播放的音乐
      message.hide();
    }
    audio.src = newTrackURL; // 设置新的音乐文件路径
    audio.load(); // 重新加载音频文件
    canplay = true; // 重置准备播放的状态
    message.show().html("点击播放新音乐");
    message.css("cursor", "pointer");
  };
  initAudio = function() {
    var context, source;
    context = new (window.AudioContext || window.webkitAudioContext)();
    analyser = context.createAnalyser();
    //   analyser.smoothingTimeConstant = 0.5
    source = null;
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = params.songArr;
    return audio.addEventListener('canplay', function() {
      var bufferLength;
      if (isPlaying) {
        message.hide();
      }
      canplay = true;
      source = context.createMediaElementSource(audio);
      source.connect(analyser);
      source.connect(context.destination);
      analyser.fftSize = TOTAL_BANDS * 2;
      bufferLength = analyser.frequencyBinCount;
      return analyserDataArray = new Uint8Array(bufferLength);
    });
  };

  startAnimation = function() {
    return requestAnimFrame(update);
  };

  initGestures = function() {
    return $(window).on('mousemove touchmove', function(e) {
      if (e.type === 'mousemove') {
        mouseX = e.clientX;
        return mouseY = e.clientY;
      } else {
        mouseX = e.originalEvent.changedTouches[0].clientX;
        return mouseY = e.originalEvent.changedTouches[0].clientY;
      }
    });
  };

  build = function() {
    stage = new PIXI.Stage(0x000000);
    renderer = PIXI.autoDetectRenderer({
      width: $(window).width(),
      height: $(window).height(),
      antialias: true,
      resolution: window.devicePixelRatio
    });
    $(document.body).append(renderer.view);
    texCircle = createCircleTex();
    return buildCircles();
  };

  buildCircles = function() {
    var circle, i, j, ref;
    circlesContainer = new PIXI.DisplayObjectContainer();
    stage.addChild(circlesContainer);
    for (i = j = 0, ref = params.numParticles - 1; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
      circle = new PIXI.Sprite(texCircle);
      circle.anchor.x = 0.5;
      circle.anchor.y = 0.5;
      circle.position.x = circle.xInit = cp.x;
      circle.position.y = circle.yInit = cp.y;
      circle.mouseRad = Math.random();
      circlesContainer.addChild(circle);
      arrCircles.push(circle);
    }
    return changeTheme(params.theme);
  };

  createCircleTex = function() {
    var gCircle;
    gCircle = new PIXI.Graphics();
    gCircle.beginFill(0xFFFFFF);
    gCircle.drawCircle(0, 0, params.radiusParticle);
    gCircle.endFill();
    return gCircle.generateTexture();
  };

  resize = function() {
    windowW = $(window).width();
    windowH = $(window).height();
    cp.x = windowW * .5;
    cp.y = windowH * .5;
    params.sizeW = windowH * params.size;
    params.sizeH = windowH * params.size;
    changeMode(params.mode);
    if (renderer) {
      return renderer.resize(windowW, windowH);
    }
  };

  changeTheme = function(name) {
    var circle, group, i, indexColor, j, padColor, ref, results;
    params.themeArr = themes[name];
    indexColor = 0;
    padColor = Math.ceil(params.numParticles / params.themeArr.length);
    results = [];
    for (i = j = 0, ref = params.numParticles - 1; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
      circle = arrCircles[i];
      group = indexColor * padColor / params.numParticles;
      circle.blendMode = params.theme === "blackWhite" ? PIXI.blendModes.NORMAL : PIXI.blendModes.ADD;
      circle.indexBand = Math.round(group * (TOTAL_BANDS - 56)) - 1;
      if (circle.indexBand <= 0) {
        circle.indexBand = 49;
      }
      circle.s = (Math.random() + (params.themeArr.length - indexColor) * 0.2) * 0.1;
      circle.scale = new PIXI.Point(circle.s, circle.s);
      if (i % padColor === 0) {
        indexColor++;
      }
      results.push(circle.tint = params.themeArr[indexColor - 1]);
    }
    return results;
  };

  changeMode = function(value) {
    var angle, circle, i, j, ref, results;
    if (!arrCircles || arrCircles.length === 0) {
      return;
    }
    if (!value) {
      value = modes[Math.floor(Math.random() * modes.length)];
    }
    params.mode = value;
    results = [];
    for (i = j = 0, ref = params.numParticles - 1; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
      circle = arrCircles[i];
      switch (params.mode) {
        // cubic
        case modes[0]:
          circle.xInit = cp.x + (Math.random() * params.sizeW - params.sizeW / 2);
          results.push(circle.yInit = cp.y + (Math.random() * params.sizeH - params.sizeH / 2));
          break;
        // circular
        case modes[1]:
          angle = Math.random() * (Math.PI * 2);
          circle.xInit = cp.x + (Math.cos(angle) * params.sizeW);
          results.push(circle.yInit = cp.y + (Math.sin(angle) * params.sizeH));
          break;
        default:
          results.push(void 0);
      }
    }
    return results;
  };

  update = function() {
    var a, angle, circle, dist, dx, dy, i, j, n, r, ref, scale, t, xpos, ypos;
    requestAnimFrame(update);
    t = performance.now() / 60;
    if (analyserDataArray && isPlaying) {
      analyser.getByteFrequencyData(analyserDataArray);
    }
    if (mouseX > 0 && mouseY > 0) {
      mousePt.x += (mouseX - mousePt.x) * 0.03;
      mousePt.y += (mouseY - mousePt.y) * 0.03;
    } else {
      a = t * 0.05;
      mousePt.x = cp.x + Math.cos(a) * 100;
      mousePt.y = cp.y + Math.sin(a) * 100;
    }
    for (i = j = 0, ref = params.numParticles - 1; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
      circle = arrCircles[i];
      if (analyserDataArray && isPlaying) {
        n = analyserDataArray[circle.indexBand];
        scale = (n / 256) * circle.s * 2;
      } else {
        scale = circle.s * .1;
      }
      scale *= params.radius;
      circle.scale.x += (scale - circle.scale.x) * 0.3;
      circle.scale.y = circle.scale.x;
      dx = mousePt.x - circle.xInit;
      dy = mousePt.y - circle.yInit;
      dist = Math.sqrt(dx * dx + dy * dy);
      angle = Math.atan2(dy, dx);
      r = circle.mouseRad * params.distance + 30;
      xpos = circle.xInit - Math.cos(angle) * r;
      ypos = circle.yInit - Math.sin(angle) * r;
      circle.position.x += (xpos - circle.position.x) * 0.1;
      circle.position.y += (ypos - circle.position.y) * 0.1;
    }
    return renderer.render(stage);
  };

  init();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiPGFub255bW91cz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLGlCQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLGdCQUFBLEVBQUEsRUFBQSxFQUFBLGVBQUEsRUFBQSxHQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxjQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUE7O0VBQUEsU0FBQSxHQUFZOztFQUVaLEtBQUEsR0FBUSxDQUFDLE9BQUQsRUFBVSxPQUFWOztFQUNSLE1BQUEsR0FBUztJQUNQLFFBQUEsRUFBUyxDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFFBQXJCLEVBQStCLFFBQS9CLENBREY7SUFFUCxXQUFBLEVBQVksQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixRQUFyQixFQUErQixRQUEvQixFQUF5QyxRQUF6QyxDQUZMO0lBR1AsU0FBQSxFQUFVLENBQUMsUUFBRCxFQUFXLFFBQVgsRUFBcUIsUUFBckIsRUFBK0IsUUFBL0IsRUFBeUMsUUFBekMsQ0FISDtJQUlQLFFBQUEsRUFBUyxDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFFBQXJCLEVBQStCLFFBQS9CLEVBQXlDLFFBQXpDLENBSkY7SUFLUCxVQUFBLEVBQVcsQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixRQUFy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LE1BQU0sQ0FBQyxRQUF6QixHQUFvQztNQUN4QyxJQUFBLEdBQU8sTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBQSxHQUFrQjtNQUN4QyxJQUFBLEdBQU8sTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBQSxHQUFrQjtNQUN4QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWhCLElBQXFCLENBQUMsSUFBQSxHQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBeEIsQ0FBQSxHQUE2QjtNQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQWhCLElBQXFCLENBQUMsSUFBQSxHQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBeEIsQ0FBQSxHQUE2QjtJQXZCcEQ7V0F5QkEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBaEI7RUExQ087O0VBNENULElBQUEsQ0FBQTtBQXZTQSIsInNvdXJjZXNDb250ZW50IjpbIkFVRElPX1VSTCA9IFwiaHR0cHM6Ly9tYTc3b3MtbWVkaWEtYXNzZXRzLnMzLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tL2F1ZGlvL3BhcmFkaXNlX2NpcmN1cy5tcDNcIlxuXG5tb2RlcyA9IFtcImN1YmljXCIsIFwiY29uaWNcIl1cbnRoZW1lcyA9IHtcbiAgcGlua0JsdWU6WzB4RkYwMDMyLCAweEZGNUMwMCwgMHgwMEZGQjgsIDB4NTNGRjAwXVxuICB5ZWxsb3dHcmVlbjpbMHhGN0Y2QUYsIDB4OUJENkEzLCAweDRFODI2NCwgMHgxQzIxMjQsIDB4RDYyODIyXVxuICB5ZWxsb3dSZWQ6WzB4RUNEMDc4LCAweEQ5NUI0MywgMHhDMDI5NDIsIDB4NTQyNDM3LCAweDUzNzc3QV1cbiAgYmx1ZUdyYXk6WzB4MzQzODM4LCAweDAwNUY2QiwgMHgwMDhDOUUsIDB4MDBCNENDLCAweDAwREZGQ11cbiAgYmxhY2tXaGl0ZTpbMHhGRkZGRkYsIDB4MDAwMDAwLCAweEZGRkZGRiwgMHgwMDAwMDAsIDB4RkZGRkZGXVxufVxuXG50aGVtZXNOYW1lcyA9IFtdXG5mb3IgaywgdiBvZiB0aGVtZXNcbiAgdGhlbWVzTmFtZXMucHVzaCBrXG5cbiMgUEFSQU1FVEVSU1xucGFyYW1zID0ge1xuICAjIHB1YmxpY1xuICBtb2RlOiBtb2Rlc1swXVxuICB0aGVtZTp0aGVtZXNOYW1lc1swXVxuICByYWRpdXM6IDNcbiAgZGlzdGFuY2U6IDYwMFxuICBzaXplOiAuNVxuXG4gICMgcHJpdmF0ZVxuICBudW1QYXJ0aWNsZXM6IDUwMDBcbiAgc2l6ZVc6IDFcbiAgc2l6ZUg6IDFcbiAgcmFkaXVzUGFydGljbGU6IDYwXG4gIHRoZW1lQXJyOnRoZW1lc1t0aGlzLnRoZW1lXVxufVxuXG5cblRPVEFMX0JBTkRTID0gMjU2XG5jcCA9IG5ldyBQSVhJLlBvaW50KClcbm1vdXNlWCA9IDBcbm1vdXNlWSA9IDBcbm1vdXNlUHQgPSBuZXcgUElYSS5Qb2ludCgpXG53aW5kb3dXID0gMFxud2luZG93SCA9IDBcblxuc3RhZ2UgPSBudWxsXG5yZW5kZXJlciA9IG51bGxcbnRleENpcmNsZSA9IG51bGxcbmNpcmNsZXNDb250YWluZXIgPSBudWxsXG5hcnJDaXJjbGVzID0gW11cbmhhbW1lcnRpbWUgPSBudWxsXG5tZXNzYWdlID0gbnVsbFxuIyBhdWRpb1xuYXVkaW8gPSBudWxsXG5hbmFseXNlciA9IG51bGxcbmFuYWx5c2VyRGF0YUFycmF5ID0gbnVsbFxuaXNQbGF5aW5nID0gZmFsc2VcbmNhbnBsYXkgPSBmYWxzZVxuIyBndWlcbmd1aSA9IG51bGxcblxuaW5pdCA9IC0+XG4gIFxuICBpbml0R2VzdHVyZXMoKVxuICBcbiAgbWVzc2FnZSA9ICQoXCIubWVzc2FnZVwiKVxuICBtZXNzYWdlLm9uKFwiY2xpY2tcIiwgcGxheSlcblxuICByZXNpemUoKVxuICBidWlsZCgpXG4gIHJlc2l6ZSgpXG5cbiAgbW91c2VQdC54ID0gY3AueFxuICBtb3VzZVB0LnkgPSBjcC55XG5cbiAgJCh3aW5kb3cpLnJlc2l6ZShyZXNpemUpXG5cbiAgc3RhcnRBbmltYXRpb24oKVxuICBpbml0R1VJKClcblxucGxheSA9IC0+XG4gIHJldHVybiBpZiBpc1BsYXlpbmdcbiAgaW5pdEF1ZGlvKClcbiAgXG4gIG1lc3NhZ2UuY3NzKFwiY3Vyc29yXCIsIFwiZGVmYXVsdFwiKVxuICBcbiAgaWYgY2FucGxheVxuICAgIG1lc3NhZ2UuaGlkZSgpXG4gIGVsc2VcbiAgICBtZXNzYWdlLmh0bWwoXCJMT0FESU5HIE1VU0lDLi4uXCIpXG4gIGF1ZGlvLnBsYXkoKVxuICBpc1BsYXlpbmcgPSB0cnVlXG4gIFxuaW5pdEdVSSA9IC0+XG4gIGd1aSA9IG5ldyBkYXQuR1VJKClcbiAgIyBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDUwMFxuICBndWkuY2xvc2UoKVxuICAgIFxuICBtb2RlQ29udHJvbGxlciA9IGd1aS5hZGQgcGFyYW1zLCAnbW9kZScsIG1vZGVzXG4gIG1vZGVDb250cm9sbGVyLm9uQ2hhbmdlICh2YWx1ZSkgLT5cbiAgICBjaGFuZ2VNb2RlIHZhbHVlXG4gICAgXG5cbiAgdGhlbWVDb250cm9sbGVyID0gZ3VpLmFkZChwYXJhbXMsICd0aGVtZScsIHRoZW1lc05hbWVzKVxuICB0aGVtZUNvbnRyb2xsZXIub25DaGFuZ2UgKHZhbHVlKSAtPlxuICAgIGNoYW5nZVRoZW1lIHBhcmFtcy50aGVtZVxuXG4gIGd1aS5hZGQgcGFyYW1zLCAncmFkaXVzJywgMSwgOFxuICBndWkuYWRkIHBhcmFtcywgJ2Rpc3RhbmNlJywgMTAwLCAxMDAwXG4gIHNpemVDb250cm9sbGVyID0gZ3VpLmFkZCBwYXJhbXMsICdzaXplJywgMCwgMVxuICBzaXplQ29udHJvbGxlci5vbkNoYW5nZSAodmFsdWUpIC0+XG4gICAgcmVzaXplIHZhbHVlXG5cbmluaXRBdWRpbyA9IC0+XG4gIGNvbnRleHQgPSBuZXcgKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCkoKVxuICBhbmFseXNlciA9IGNvbnRleHQuY3JlYXRlQW5hbHlzZXIoKVxuIyAgIGFuYWx5c2VyLnNtb290aGluZ1RpbWVDb25zdGFudCA9IDAuNVxuXG4gIHNvdXJjZSA9IG51bGwgXG4gIFxuICBhdWRpbyA9IG5ldyBBdWRpbygpXG4gIGF1ZGlvLmNyb3NzT3JpZ2luID0gXCJhbm9ueW1vdXNcIlxuICBhdWRpby5zcmMgPSBBVURJT19VUkxcbiAgXG4gIGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIgJ2NhbnBsYXknLCAtPlxuICAgIGlmKGlzUGxheWluZylcbiAgICAgIG1lc3NhZ2UuaGlkZSgpXG4gICAgICBcbiAgICBjYW5wbGF5ID0gdHJ1ZVxuXG4gICAgc291cmNlID0gY29udGV4dC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UgYXVkaW9cbiAgICBzb3VyY2UuY29ubmVjdCBhbmFseXNlclxuICAgIHNvdXJjZS5jb25uZWN0IGNvbnRleHQuZGVzdGluYXRpb25cblxuICAgIGFuYWx5c2VyLmZmdFNpemUgPSBUT1RBTF9CQU5EUyAqIDJcbiAgICBidWZmZXJMZW5ndGggPSBhbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudFxuICAgIGFuYWx5c2VyRGF0YUFycmF5ID0gbmV3IFVpbnQ4QXJyYXkgYnVmZmVyTGVuZ3RoXG5cbiAgXG5cbnN0YXJ0QW5pbWF0aW9uID0gLT5cbiAgcmVxdWVzdEFuaW1GcmFtZSh1cGRhdGUpXG4gIFxuXG5pbml0R2VzdHVyZXMgPSAtPlxuICAgJCh3aW5kb3cpLm9uICdtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGUpIC0+XG4gICAgICBpZiBlLnR5cGUgPT0gJ21vdXNlbW92ZSdcbiAgICAgICAgbW91c2VYID0gZS5jbGllbnRYXG4gICAgICAgIG1vdXNlWSA9IGUuY2xpZW50WVxuICAgICAgZWxzZVxuICAgICAgICBtb3VzZVggPSBlLm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WFxuICAgICAgICBtb3VzZVkgPSBlLm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WVxuXG5cblxuYnVpbGQgPSAtPlxuICBzdGFnZSA9IG5ldyBQSVhJLlN0YWdlIDB4MDAwMDAwXG4gIHJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIge1xuICAgIHdpZHRoOiAkKHdpbmRvdykud2lkdGgoKVxuICAgIGhlaWdodDokKHdpbmRvdykuaGVpZ2h0KClcbiAgICBhbnRpYWxpYXM6dHJ1ZVxuICAgIHJlc29sdXRpb246d2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgfVxuXG4gICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kIHJlbmRlcmVyLnZpZXdcblxuICB0ZXhDaXJjbGUgPSBjcmVhdGVDaXJjbGVUZXgoKVxuXG4gIGJ1aWxkQ2lyY2xlcygpXG5cbmJ1aWxkQ2lyY2xlcyA9IC0+XG4gIGNpcmNsZXNDb250YWluZXIgPSBuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKClcbiAgc3RhZ2UuYWRkQ2hpbGQoY2lyY2xlc0NvbnRhaW5lcilcblxuICBmb3IgaSBpbiBbMC4ucGFyYW1zLm51bVBhcnRpY2xlcy0xXVxuICAgIGNpcmNsZSA9IG5ldyBQSVhJLlNwcml0ZSB0ZXhDaXJjbGVcbiAgICBjaXJjbGUuYW5jaG9yLnggPSAwLjVcbiAgICBjaXJjbGUuYW5jaG9yLnkgPSAwLjVcbiAgICBcbiAgICBjaXJjbGUucG9zaXRpb24ueCA9IGNpcmNsZS54SW5pdCA9IGNwLnhcbiAgICBjaXJjbGUucG9zaXRpb24ueSA9IGNpcmNsZS55SW5pdCA9IGNwLnlcbiAgICBjaXJjbGUubW91c2VSYWQgPSBNYXRoLnJhbmRvbSgpXG4gICAgXG4gICAgY2lyY2xlc0NvbnRhaW5lci5hZGRDaGlsZChjaXJjbGUpXG4gICAgYXJyQ2lyY2xlcy5wdXNoKGNpcmNsZSlcblxuXG4gIGNoYW5nZVRoZW1lIHBhcmFtcy50aGVtZVxuICBcblxuY3JlYXRlQ2lyY2xlVGV4ID0gLT5cbiAgZ0NpcmNsZSA9IG5ldyBQSVhJLkdyYXBoaWNzKClcbiAgZ0NpcmNsZS5iZWdpbkZpbGwoMHhGRkZGRkYpXG4gIGdDaXJjbGUuZHJhd0NpcmNsZSgwLCAwLCBwYXJhbXMucmFkaXVzUGFydGljbGUpXG4gIGdDaXJjbGUuZW5kRmlsbCgpXG5cbiAgZ0NpcmNsZS5nZW5lcmF0ZVRleHR1cmUoKVxuXG5yZXNpemUgPSAtPlxuICB3aW5kb3dXID0gJCh3aW5kb3cpLndpZHRoKClcbiAgd2luZG93SCA9ICQod2luZG93KS5oZWlnaHQoKVxuICBjcC54ID0gd2luZG93VyAqIC41XG4gIGNwLnkgPSB3aW5kb3dIICogLjVcblxuICBwYXJhbXMuc2l6ZVcgPSB3aW5kb3dIICogcGFyYW1zLnNpemVcbiAgcGFyYW1zLnNpemVIID0gd2luZG93SCAqIHBhcmFtcy5zaXplXG5cbiAgY2hhbmdlTW9kZShwYXJhbXMubW9kZSlcblxuICBpZiByZW5kZXJlclxuICAgIHJlbmRlcmVyLnJlc2l6ZSh3aW5kb3dXLCB3aW5kb3dIKVxuXG5jaGFuZ2VUaGVtZSA9IChuYW1lKS0+XG4gIHBhcmFtcy50aGVtZUFyciA9IHRoZW1lc1tuYW1lXVxuICBpbmRleENvbG9yID0gMFxuICBwYWRDb2xvciA9IE1hdGguY2VpbCBwYXJhbXMubnVtUGFydGljbGVzIC8gcGFyYW1zLnRoZW1lQXJyLmxlbmd0aFxuICBmb3IgaSBpbiBbMC4ucGFyYW1zLm51bVBhcnRpY2xlcy0xXVxuICAgIGNpcmNsZSA9IGFyckNpcmNsZXNbaV1cbiAgICBncm91cCA9IGluZGV4Q29sb3IgKiBwYWRDb2xvciAvIHBhcmFtcy5udW1QYXJ0aWNsZXNcbiAgICBjaXJjbGUuYmxlbmRNb2RlID0gaWYgcGFyYW1zLnRoZW1lID09IFwiYmxhY2tXaGl0ZVwiIHRoZW4gUElYSS5ibGVuZE1vZGVzLk5PUk1BTCBlbHNlIFBJWEkuYmxlbmRNb2Rlcy5BRERcbiAgICBjaXJjbGUuaW5kZXhCYW5kID0gTWF0aC5yb3VuZChncm91cCAqIChUT1RBTF9CQU5EUy01NikpLTFcbiAgICBpZiBjaXJjbGUuaW5kZXhCYW5kIDw9IDBcbiAgICAgIGNpcmNsZS5pbmRleEJhbmQgPSA0OVxuICAgIGNpcmNsZS5zID0gKE1hdGgucmFuZG9tKCkgKyAocGFyYW1zLnRoZW1lQXJyLmxlbmd0aC1pbmRleENvbG9yKSowLjIpKjAuMVxuICAgIGNpcmNsZS5zY2FsZSA9IG5ldyBQSVhJLlBvaW50KGNpcmNsZS5zLCBjaXJjbGUucylcbiAgICBpZiBpICUgcGFkQ29sb3IgPT0gMFxuICAgICAgaW5kZXhDb2xvcisrXG5cbiAgICBjaXJjbGUudGludCA9IHBhcmFtcy50aGVtZUFycltpbmRleENvbG9yIC0gMV1cblxuXG5jaGFuZ2VNb2RlID0gKHZhbHVlKS0+XG4gIHJldHVybiBpZiAhYXJyQ2lyY2xlcyB8fCBhcnJDaXJjbGVzLmxlbmd0aCA9PSAwXG5cbiAgIyByYW5kb21pemUgbW9kZSBpZiBub3Qgc3BlY2lmaWVkXG4gIGlmICF2YWx1ZVxuICAgIHZhbHVlID0gbW9kZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKm1vZGVzLmxlbmd0aCldXG5cbiAgcGFyYW1zLm1vZGUgPSB2YWx1ZVxuXG4gIGZvciBpIGluIFswLi5wYXJhbXMubnVtUGFydGljbGVzLTFdXG4gICAgY2lyY2xlID0gYXJyQ2lyY2xlc1tpXVxuICAgIFxuICAgIHN3aXRjaCBwYXJhbXMubW9kZVxuICAgICAgIyBjdWJpY1xuICAgICAgd2hlbiBtb2Rlc1swXVxuICAgICAgICBjaXJjbGUueEluaXQgPSBjcC54ICsgKE1hdGgucmFuZG9tKCkgKiBwYXJhbXMuc2l6ZVcgLSBwYXJhbXMuc2l6ZVcvMilcbiAgICAgICAgY2lyY2xlLnlJbml0ID0gY3AueSArIChNYXRoLnJhbmRvbSgpICogcGFyYW1zLnNpemVIIC0gcGFyYW1zLnNpemVILzIpXG5cbiAgICAgICMgY2lyY3VsYXJcbiAgICAgIHdoZW4gbW9kZXNbMV1cbiAgICAgICAgYW5nbGUgPSBNYXRoLnJhbmRvbSgpICogKE1hdGguUEkgKiAyKVxuICAgICAgICBjaXJjbGUueEluaXQgPSBjcC54ICsgKE1hdGguY29zKGFuZ2xlKSpwYXJhbXMuc2l6ZVcpXG4gICAgICAgIGNpcmNsZS55SW5pdCA9IGNwLnkgKyAoTWF0aC5zaW4oYW5nbGUpKnBhcmFtcy5zaXplSClcblxudXBkYXRlID0gLT5cbiAgcmVxdWVzdEFuaW1GcmFtZSh1cGRhdGUpXG4gIFxuICB0ID0gcGVyZm9ybWFuY2Uubm93KCkgLyA2MFxuXG4gIGlmIGFuYWx5c2VyRGF0YUFycmF5ICYmIGlzUGxheWluZ1xuICAgIGFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhIGFuYWx5c2VyRGF0YUFycmF5XG5cblxuICBpZiBtb3VzZVggPiAwICYmIG1vdXNlWSA+IDBcbiAgICBtb3VzZVB0LnggKz0gKG1vdXNlWCAtIG1vdXNlUHQueCkgKiAwLjAzXG4gICAgbW91c2VQdC55ICs9IChtb3VzZVkgLSBtb3VzZVB0LnkpICogMC4wM1xuICBlbHNlXG4gICAgYSA9IHQqMC4wNVxuICAgIG1vdXNlUHQueCA9IGNwLnggKyBNYXRoLmNvcyhhKSAqIDEwMFxuICAgIG1vdXNlUHQueSA9IGNwLnkgKyBNYXRoLnNpbihhKSAqIDEwMFxuXG4gIGZvciBpIGluIFswLi5wYXJhbXMubnVtUGFydGljbGVzLTFdXG4gICAgY2lyY2xlID0gYXJyQ2lyY2xlc1tpXVxuXG4gICAgaWYgYW5hbHlzZXJEYXRhQXJyYXkgJiYgaXNQbGF5aW5nXG4gICAgICBuID0gYW5hbHlzZXJEYXRhQXJyYXlbY2lyY2xlLmluZGV4QmFuZF1cbiAgICAgIHNjYWxlID0gKChuIC8gMjU2KSkgKiBjaXJjbGUucyoyXG4gICAgZWxzZVxuICAgICAgc2NhbGUgPSBjaXJjbGUucyouMVxuXG4gICAgc2NhbGUgKj0gcGFyYW1zLnJhZGl1c1xuXG4gICAgY2lyY2xlLnNjYWxlLnggKz0gKHNjYWxlIC0gY2lyY2xlLnNjYWxlLngpICogMC4zXG4gICAgY2lyY2xlLnNjYWxlLnkgPSBjaXJjbGUuc2NhbGUueFxuXG4gICAgZHggPSBtb3VzZVB0LnggLSBjaXJjbGUueEluaXRcbiAgICBkeSA9IG1vdXNlUHQueSAtIGNpcmNsZS55SW5pdFxuICAgIGRpc3QgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpXG4gICAgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeClcblxuICAgIHIgPSBjaXJjbGUubW91c2VSYWQgKiBwYXJhbXMuZGlzdGFuY2UgKyAzMFxuICAgIHhwb3MgPSBjaXJjbGUueEluaXQgLSBNYXRoLmNvcyhhbmdsZSkgKiByXG4gICAgeXBvcyA9IGNpcmNsZS55SW5pdCAtIE1hdGguc2luKGFuZ2xlKSAqIHJcbiAgICBjaXJjbGUucG9zaXRpb24ueCArPSAoeHBvcyAtIGNpcmNsZS5wb3NpdGlvbi54KSAqIDAuMVxuICAgIGNpcmNsZS5wb3NpdGlvbi55ICs9ICh5cG9zIC0gY2lyY2xlLnBvc2l0aW9uLnkpICogMC4xXG5cbiAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKVxuXG5pbml0KCkiXX0=
//# sourceURL=coffeescript