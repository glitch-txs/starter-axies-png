import React, { useState } from 'react'
import { useEffect } from 'react'
import { PuffLoading } from './puff-loading/PuffLoading'
import style from './starters.module.scss'

type Props = {}

const Starters = (props: Props) => {

    const id = ['1',"2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];
    const [direction, setDirection] = useState(1)
    const [axie, setAxie] = useState<string>('1')
    const [isLoading, setIsloading] = useState<boolean>(false)

    let lastFrameTime = Date.now() / 1000;
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let skeletonRenderer: any;
    let animationState: any;
    let skeleton: any;
    let bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  
    const handleSelect = (value:string)=>{
        setAxie(value)
    }

    async function load() {
        canvas = document.getElementById("canvas") as HTMLCanvasElement;
        context = canvas?.getContext("2d") as CanvasRenderingContext2D;
        context.clearRect(0, 0, canvas.width, canvas.height)
        setIsloading(true)
  
        const SkeletonRenderer_ =  (await import('@esotericsoftware/spine-canvas')).SkeletonRenderer
        skeletonRenderer = new SkeletonRenderer_(context);
  
        // Load the assets.
        const AssetManager_ =  (await import('@esotericsoftware/spine-canvas')).AssetManager
        const assetManager = new AssetManager_("assets/" + axie + "/");
        assetManager.loadText(axie + ".asset");
        assetManager.loadTextureAtlas(axie + ".atlas.asset");
        await assetManager.loadAll();
  
        // Create the texture atlas and skeleton data.
        const atlas = assetManager.require(axie + ".atlas.asset");
  
        const AtlasAttachmentLoader_ =  (await import('@esotericsoftware/spine-canvas')).AtlasAttachmentLoader
        const atlasLoader = new AtlasAttachmentLoader_(atlas);
  
        const SkeletonJson_ =  (await import('@esotericsoftware/spine-canvas')).SkeletonJson
        const skeletonJson = new SkeletonJson_(atlasLoader);
        const skeletonData = skeletonJson.readSkeletonData(assetManager.require(axie + ".asset"));
  
        // Instantiate a new skeleton based on the atlas and skeleton data.
        const Skeleton_ =  (await import('@esotericsoftware/spine-canvas')).Skeleton
        skeleton = new Skeleton_(skeletonData);
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        bounds = skeleton.getBoundsRect();
  
        // Setup an animation state with a default mix of 0.2 seconds.
        const AnimationStateData_ =  (await import('@esotericsoftware/spine-canvas')).AnimationStateData
        const animationStateData = new AnimationStateData_(skeleton.data);
        animationStateData.defaultMix = 0.2;
        animationStateData.setMix("draft/run-origin", "action/idle/normal", 0.1)
        animationStateData.setMix("action/idle/normal", "draft/run-origin", 0.2)
          
        const AnimationState_ =  (await import('@esotericsoftware/spine-canvas')).AnimationState
        animationState = new AnimationState_(animationStateData);
  
        // Set the run animation, looping.
        // animationState.setAnimation(0, "attack/melee/horn-gore", false);
  
        // Start rendering.
        requestAnimationFrame(render);
        setIsloading(false)

      }
  
      function render() {
          // Calculate the delta time between this and the last frame in seconds.
          var now = Date.now() / 1000;
          var delta = now - lastFrameTime;
          lastFrameTime = now;
  
          // Resize the canvas drawing buffer if the canvas CSS width and height changed
          // and clear the canvas.
          if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
              canvas.width = canvas.clientWidth;
              canvas.height = canvas.clientHeight;
          }
          context.clearRect(0, 0, canvas.width, canvas.height);
  
          // Center the skeleton and resize it so it fits inside the canvas.
          skeleton.x = canvas.width / 2;
          skeleton.y = canvas.height - canvas.height * 0.3;
          let scale = canvas.height / bounds.height * 0.4;
          skeleton.scaleX = scale * direction;
          skeleton.scaleY = -scale;
  
          // Update and apply the animation state, update the skeleton's
          // world transforms and render the skeleton.
          animationState.update(delta);
          animationState.apply(skeleton);
          skeleton.updateWorldTransform();
          skeletonRenderer.draw(skeleton);
  
          requestAnimationFrame(render);
      }
  
  
    useEffect(() => {
      load()
    }, [direction, axie])
    
  
      
    var download = function(){
            var link = document.createElement('a');
            link.download = 'starter-' + axie + '.png';
            link.href = (document.getElementById('canvas') as HTMLCanvasElement )?.toDataURL()
            link.click();
        }

    const handleToggle = ()=>{
      setDirection(prev => - prev)
    }

  return (
    <div>
      { isLoading ? <PuffLoading size={300}/> : <></> }
      <canvas id="canvas" style={{width: '100%', height: '80vh', backgroundColor: 'transparent'}}></canvas>
      <div className={style.container}>
      <select className={style.select} name="axie" id="axie"  onChange={(e)=> handleSelect(e.target.value)}>
        {
          id.map((item, index)=>(
            <option key={index} value={item}> { item } </option>
          ))
        }
        </select>

        <div className={style.direction}>
            <div className={style.title} >
                Axie Direction
            </div>

            <label className={style.toggleControl}>
                <input type="checkbox" onChange={handleToggle} />
                <span className={style.control}></span>
            </label>
        </div>

        <button className={style.btn} onClick={download} >Download PNG</button>
      </div>
    </div>
  )
}

export default Starters