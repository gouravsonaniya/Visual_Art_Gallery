

let camera,
  renderer1,
  scene,
  uniformsBlob,
  uniformsPano,
  container1 = document.getElementById("canvas_container1"),
  bg = document.querySelector(".bg"),
  floor = document.querySelector(".floor"),
  btn_Light = document.querySelector(".btn_Light"),
  timeout_Debounce,
  lightOFF = true,
  renderer2,
  camera2,
  scene2,
  sprites = new THREE.Group(),
  container2 = document.getElementById("canvas_container2"),
  mouse = { x: 1 }


init();
animate();


function init() {
  renderer1 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer1.setSize(container1.clientWidth, container1.clientHeight);
  renderer1.setPixelRatio(window.devicePixelRatio);
  container1.appendChild(renderer1.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, container1.clientWidth / container1.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 40);

  const light1 = new THREE.DirectionalLight("#ffffff", 0.7);
  light1.position.set(-10, 30, 20);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight("#ffffff", 0.7);
  light2.position.set(10, 30, 20);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight("#fcfcfc", 0.3);
  light3.position.set(0, -20, 10);
  scene.add(light3);

  const textureLoader = new THREE.TextureLoader();
  const blobTexture = textureLoader.load("https://i.ibb.co/9sk6j71/blob1-ls1rst.jpg");
  const panoTexture = textureLoader.load("https://i.ibb.co/ynL0QP5/pano-ex9djn.jpg");



  /***   Blob   ***/
  let blobGeometry = new THREE.IcosahedronBufferGeometry(10, 50);

  uniformsBlob = THREE.UniformsUtils.merge([uniformsBlob, THREE.UniformsLib["lights"]]);
  Object.assign(uniformsBlob, {
    t_texture: { type: "t", value: blobTexture },
    u_time: { type: "f", value: 0.0 },
    u_mouse1: { type: "v2", value: new THREE.Vector2(1, 1) },
    u_mouse2: { type: "v2", value: new THREE.Vector2(20, 20) },
    u_lightOFF: { type: "b", value: lightOFF },
    u_effect_Switch: { type: "f", value: 0.0 },
    u_textura_Zoom: { type: "f", value: 1.0 },
  });

  uniformsBlob.t_texture.value.anisotropy = 16
  uniformsBlob.t_texture.value.wrapS = THREE.MirroredRepeatWrapping;
  uniformsBlob.t_texture.value.wrapT = THREE.ClampToEdgeWrapping;

  let shaderMaterialBlob = new THREE.ShaderMaterial({
    uniforms: uniformsBlob,
    fragmentShader: blobFragmentShader(),
    vertexShader: blobVertexShader(),
    lights: true,
  });
  blob = new THREE.Mesh(blobGeometry, shaderMaterialBlob);
  blob.position.set(2, -2.2, 10);
  scene.add(blob);



  /***     Pano     ****/
  let panoGeometry = new THREE.PlaneBufferGeometry(54.5, 27.3);

  uniformsPano = {
    t_texture: { type: "t", value: panoTexture },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_time: { type: 'f', value: 0 },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_lightOFF: { type: "b", value: lightOFF },
    u_randomColor: { type: "v3", value: new THREE.Vector3(0.2, 0.2, 0.2) },
    u_panoScale: { type: "v2", value: new THREE.Vector2(10.1, 0.2) },
  };

  uniformsPano.u_resolution.value.x = renderer1.domElement.width;
  uniformsPano.u_resolution.value.y = renderer1.domElement.height;
  
  uniformsPano.t_texture.value.wrapS = THREE.ClampToEdgeWrapping;
  uniformsPano.t_texture.value.wrapT = THREE.ClampToEdgeWrapping;

  let shaderMaterialPano = new THREE.ShaderMaterial({
    uniforms: uniformsPano,
    fragmentShader: panoFragmentShader(),
    vertexShader: panoVertexShader(),
  });
  pano = new THREE.Mesh(panoGeometry, shaderMaterialPano);
  pano.position.set(0.5, -1.6, 10);
  scene.add(pano);


  /*   Mouse Event Handler  */
  function norm(val, max, min) { return (val - min) / (max - min); }
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;

    let x = norm(-(container1.clientWidth / 2 - e.x), container1.clientWidth / 2, 0) + 0.999;
    if (x > 0) uniformsBlob.u_mouse1.value.x = x - 1;
    else uniformsBlob.u_mouse1.value.x = x + 1;

    uniformsBlob.u_mouse1.value.y =  norm(container1.clientHeight / 2 - e.y, container1.clientHeight / 2, 0);

    uniformsBlob.u_mouse2.value.x = norm(e.x, container1.clientWidth, 0) + 0.5;
    uniformsPano.u_mouse.value.x = uniformsBlob.u_mouse2.value.x - 0.5;
    uniformsPano.u_mouse.value.y = uniformsBlob.u_mouse1.value.y
  });



  /*   CANVAS 2  Particles  */
  let spriteSet = function () {
    let h = window.innerHeight;

    renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer2.setSize(window.innerWidth, h);
    renderer2.setPixelRatio(window.devicePixelRatio);
    container2.appendChild(renderer2.domElement);
    scene2 = new THREE.Scene();

    //better to do this dynamically
    camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / h, 0.1, 1000);
    camera2.position.set(0, 0, 40);
    if (h <= 500) camera2.position.set(0, 0, 40);
    else if (h > 500 && h <= 600) camera2.position.set(0, -3, 50);
    else if (h > 600 && h <= 700) camera2.position.set(0, -12, 60);
    else if (h > 700 && h <= 800) camera2.position.set(0, -18, 60);
    else if (h > 800 && h <= 900) camera2.position.set(0, -25, 60);
    else camera2.position.set(0, -28, 60);

    for (var i = 0; i < 1000; i++) {
      spriteMaterial = new THREE.SpriteMaterial({
        transparent: true,
        opacity: 0.8,
      });
      let sprite = new THREE.Sprite(spriteMaterial);

      sprite.position.set(
        THREE.MathUtils.randFloat(-40, 40),    //x
        THREE.MathUtils.randFloat(-22, 17),    //y 
        THREE.MathUtils.randFloat(-1, -6),     //z
      );
      sprite.scale.set(0.8, 0.8);

      //can't do in shader because is difference renderer from pano
      if (sprite.position.y > 12 && sprite.position.y <= 17) spriteMaterial.color.set("#F9BE6E");
      else if (sprite.position.y > 8 && sprite.position.y <= 12) spriteMaterial.color.set("#F9DA8A");
      else if (sprite.position.y > 3 && sprite.position.y <= 8) spriteMaterial.color.set("#E29A50");
      else if (sprite.position.y > 0 && sprite.position.y <= 3) spriteMaterial.color.set("#7A5437");
      else if (sprite.position.y > -11 && sprite.position.y <= 0) spriteMaterial.color.set("#1B5A7D");
      else if (sprite.position.y > -16 && sprite.position.y <= -11) spriteMaterial.color.set("#038BA5");
      else if (sprite.position.y >= -22 && sprite.position.y <= -16) spriteMaterial.color.set("#CCD79F");

      sprite.velocity = {
        x: (Math.random() - 0.5) / 6,
        z: -0.1 - Math.random() / 4
      }
      sprites.add(sprite);
    }
    scene2.add(sprites);
    spriteSet = function () { };
  }



  btn_Light.addEventListener("click", e => {
    if (lightOFF) {
      sprites.visible = true;
      bg.style.webkitFilter = "brightness(25%)";
      floor.style.webkitFilter = "brightness(25%)";
      btn_Light.innerHTML = "Light  ON";
      lightOFF = false;
      btn_Light.style.color = "#3ef93e";
      uniformsPano.u_lightOFF.value = false;
      uniformsBlob.u_lightOFF.value = false;
      spriteSet(); 
      uniformsPano.u_panoScale.value.x = 80;   
      uniformsPano.u_panoScale.value.y = 0;   

    } else {
      bg.style.webkitFilter = "brightness(100%)";
      floor.style.webkitFilter = "brightness(100%)";
      btn_Light.innerHTML = "Light OFF";
      btn_Light.style.color = "#feaeae";
      lightOFF = true;
      uniformsBlob.u_lightOFF.value = true;
      uniformsPano.u_lightOFF.value = true;
      sprites.visible = false;                   
      renderer2.clear();                         

      if (uniformsBlob.u_effect_Switch.value == 0.0) {
        uniformsBlob.u_effect_Switch.value = 0.08;  
        uniformsPano.u_randomColor.value.x = THREE.MathUtils.randFloat(-0.9, -0.5);
        uniformsPano.u_randomColor.value.y = uniformsPano.u_randomColor.value.x;
        uniformsPano.u_randomColor.value.z = uniformsPano.u_randomColor.value.x;
        uniformsPano.u_panoScale.value.x = 10;   
        uniformsPano.u_panoScale.value.y = 5.4;  
      }

      else {
        uniformsBlob.u_effect_Switch.value = 0.0;
        uniformsPano.u_panoScale.value.x = 40;    
        uniformsPano.u_panoScale.value.y = 0;  
        uniformsPano.u_randomColor.value.x = 0.2;
        uniformsPano.u_randomColor.value.y = 0.2;
        uniformsPano.u_randomColor.value.z = 0.2;
      }
    }
    document.querySelector(".pngLights").classList.toggle("active");   
  });
}


function blobVertexShader() {
  return `
    varying vec3 v_normal;      
    varying vec2 v_uv;

    uniform float u_time;
    uniform vec2 u_mouse1;
    uniform bool u_lightOFF;
    
    /***   Classic 3D Perlin noise, periodic version by Stefan Gustavson  ***/
    vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r;}
    vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0);}
    float pnoise(vec3 P, vec3 rep) {
      vec3 Pi0 = mod(floor(P), rep); 
      vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); 
      Pi0 = mod289(Pi0);
      Pi1 = mod289(Pi1);
      vec3 Pf0 = fract(P);
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;
    
      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);
    
      vec4 gx0 = ixy0 * (1.0 / 7.0);
      vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
      vec4 gx1 = ixy1 * (1.0 / 7.0);
      vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;
    
      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);
    
      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
      return 2.2 * n_xyz;
    }

    void main() {
        v_normal = normalMatrix * normal;
        v_uv = uv;

        // Static Boolean Uniform in conditional 
        if (u_lightOFF) {
            float b = 6.0 * pnoise( (u_mouse1.y - u_mouse1.x)/10. * position + vec3( u_time*2.), vec3( 10.0 ) );    
            vec3 newPosition = position + normal * b;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        } else {
            gl_Position =  vec4( 0.0, 0.0, -50.0, 1.0 );   
        }
   }
  `
}

function blobFragmentShader() {
  return `  
      varying vec3 v_normal;
      varying vec2 v_uv;
      
      uniform sampler2D t_texture; 
      uniform vec2 u_mouse2;       
      uniform float u_time;          
      uniform bool u_lightOFF;        
      uniform float u_effect_Switch;  
      uniform float u_textura_Zoom;   

      float random( vec3 scale, float seed ){
        return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
      }

      struct DirectionalLight {
        vec3 direction;    
        vec3 color;
      };
      uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

      void main() {
          if (u_lightOFF) {
              /*** Light ***/
                vec3 lightFactor1 = vec3(0.0, 0.0, 0.0);
                vec3 lightFactor2 = vec3(0.0, 0.0, 0.0);
                vec3 lightFactor3 = vec3(0.0, 0.0, 0.0);
      
                vec3  ecFromLight1 = normalize( directionalLights[0].direction );            
                float NdotL1 = max(0.1, dot(v_normal, ecFromLight1));    
                lightFactor1 += NdotL1 * directionalLights[0].color; 
      
                vec3  ecFromLight2 = normalize( directionalLights[1].direction  );
                float NdotL2 = max(0.1, dot(v_normal, ecFromLight2));
                lightFactor2 += NdotL2 * directionalLights[1].color; 
      
                vec3  ecFromLight3 = normalize( directionalLights[2].direction  );
                float NdotL3 = max(0.0, dot(v_normal, ecFromLight3));
                lightFactor3 += NdotL3 * directionalLights[2].color; 
      
                vec3 directionalLights = lightFactor1 + lightFactor2 + lightFactor3;
      
              /*** texture Effect Distortion  ***/
                float effect = random( vec3( 12.9898, 78.233, 151.7182), 0.0 ) * u_effect_Switch;
                
                vec4 color = texture2D( t_texture, (v_uv + effect  + u_time/3.) + sin(u_mouse2) * u_textura_Zoom );  
                gl_FragColor = vec4( color.rgb  * directionalLights, 1.0 );

          } else {
                gl_FragColor = vec4( 0.0, 0.0, 0.0, 0.0 );               
          }
      }
    `
}




function panoVertexShader() {
  return `
      varying vec2 v_uv;         
      void main() {
         v_uv = uv;
         gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
  `
}

function panoFragmentShader() {
  return `
      uniform sampler2D t_texture;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform bool u_lightOFF;     
      uniform vec3 u_randomColor; 
      uniform vec2 u_panoScale; 

      varying vec2 v_uv;

      // voronoise by inigo quilez - iq/2013
      vec3 hash3( vec2 p ) {
          vec3 q = vec3( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)), dot(p,vec2(419.2,371.9)) );
          return fract(sin(q)*43758.5453 + u_time+ sin(u_mouse.y)/2.  );                                            
      }
      float iqnoise( in vec2 x, float u, float v ) {
          vec2 p = floor(x);
          vec2 f = fract(x);
          float k = 1.0+63.0*pow(1.0-v,4.0);
          float va = 0.0;
          float wt = 0.0;
          for (int j=-2; j<=2; j++) {
              for (int i=-2; i<=2; i++) {
                  vec2 g = vec2(float(i),float(j));
                  vec3 o = hash3(p + g)*vec3(u,u,1.0);
                  vec2 r = g - f + o.xy;
                  float d = dot(r,r);
                  float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
                  va += o.z*ww;
                  wt += ww;
              }
          }
          return va/wt;
      }
  
     void main() {
          vec2 st = gl_FragCoord.xy/u_resolution.xy;
          st.x *= u_resolution.x/u_resolution.y;
   
          st *= u_panoScale.x + 5.0 + sin(u_mouse.y)/2. * u_panoScale.y;

          float n = iqnoise(st, u_mouse.x, 0.0);

          if (u_lightOFF) {
               gl_FragColor = vec4(vec3(n + u_randomColor.r,   n + u_randomColor.g,   n + u_randomColor.b) ,1.0);                          
          } else {
               vec4 textura = texture2D( t_texture, v_uv + vec2(u_mouse.x, 0.0)/10. );    
               gl_FragColor = vec4( textura.rgb  *  vec3(n), 1.0);
          }
      }
  `
}



function animate() {
  uniformsBlob.u_time.value += 0.0015;
  uniformsPano.u_time.value += 0.01;

  for (var i = 0; i < sprites.children.length; i++) {
    if (lightOFF) { break; }                    

    let pos = sprites.children[i].position;
    let velocity = sprites.children[i].velocity;

    pos.x = pos.x - (velocity.x);
    pos.z = pos.z - (velocity.z);

    velocity.z = velocity.z - Math.sin(mouse.x) / 200;
    pos.z <= -5  ?  sprites.children[i].visible = false  :  sprites.children[i].visible = true;

    if (pos.z >= 61 || pos.z <= -20) {
      pos.z = -5;
      velocity.z = -0.1 - Math.random() / 4;
    }

    if (pos.x <= -40 || pos.x >= 40) velocity.x = velocity.x * -0.8;
  }

  renderer1.render(scene, camera);
  if (renderer2 && !lightOFF) renderer2.render(scene2, camera2);
  requestAnimationFrame(animate);
}


/*     Resize     */
window.addEventListener("resize", () => {
  clearTimeout(timeout_Debounce);
  timeout_Debounce = setTimeout(onWindowResize, 20); 
});
function onWindowResize() {
  camera.aspect = container1.clientWidth / container1.clientHeight;
  camera.updateProjectionMatrix();
  renderer1.setSize(container1.clientWidth, container1.clientHeight);

  if (renderer2 && !lightOFF) {
    let h = window.innerHeight;
    if (h <= 500) camera2.position.set(0, 0, 40);
    else if (h > 500 && h <= 600) camera2.position.set(0, -3, 50);
    else if (h > 600 && h <= 700) camera2.position.set(0, -12, 60);
    else if (h > 700 && h <= 800) camera2.position.set(0, -18, 60);
    else if (h > 800 && h <= 900) camera2.position.set(0, -25, 60);
    else camera2.position.set(0, -28, 60);

    
    camera2.aspect = window.innerWidth / h;
    camera2.updateProjectionMatrix();
    renderer2.setSize(window.innerWidth, h);
  }
  uniformsPano.u_resolution.value.x = renderer1.domElement.width;
  uniformsPano.u_resolution.value.y = renderer1.domElement.height;
}

/*  Call for action  */
setInterval(() => { btn_Light.classList.toggle("blink") }, 3000);