import { _decorator, Component,instantiate, Camera, input, Input, Vec2, geometry, PhysicsSystem, EventTouch, Node } from 'cc';
import { Configs } from '../../utils/Configs';
import { ResouceUtils } from '../../utils/ResouceUtils';
import { GameModel } from '../model/GameModel';
import { WinUI } from '../ui/WinUI';
import { LevelController } from './LevelController';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(GameModel)
    private gameModel:GameModel;
    @property(Camera)
    private camera:Camera;
    //
    private currentLevelNumber:number = 1;
    //
    @property(Node)
    private currentLevelNode:Node;

    start() {
        //create raycast
        input.on(Input.EventType.TOUCH_START,this.onTouchScreen,this);
        //set callback
        this.startLastLevel();
    }
    private startLastLevel(){
        
    }
   
    private winLevel(){
        //
        let winUI = instantiate(this.gameModel.winUIPrefab);
        winUI.getComponent(WinUI).setUp(()=>{
            //onNext Level
            this.currentLevelNumber++;
            this.nextLevel();
        })
        this.gameModel.canvasUI.addChild(winUI);
    }
    //
    //next level
    private nextLevel(){
        //
        this.gameModel.lbGameLevel.string = 'Level '+ this.currentLevelNumber;
        ResouceUtils.loadPrefab(Configs.LOAD_LEVEL_PATH+this.currentLevelNumber,(lvPrefab)=>{
            //
            this.currentLevelNode = instantiate(lvPrefab);
            this.currentLevelNode.getComponent(LevelController).setUp(()=>{
                //win level event
                this.winLevel();
            })
            this.gameModel.gamePlayNode.addChild(this.currentLevelNode);
        })
        //
        this.preloadNextLevel();
    }
    private preloadNextLevel(){
            //preload to prepare next level to use later;
            let nextLevelPath = Configs.LOAD_LEVEL_PATH+(this.currentLevelNumber+1);
            ResouceUtils.preloadPrefab(nextLevelPath);
    }
    //raycast handle
    private onTouchScreen(touch: EventTouch){
        let loc:Vec2 = touch.getLocation();
        this.onRay(loc);
    }
    private onRay(position:Vec2){
        if (this.camera) {
            //create a ray through all collider;
            let _ray: geometry.Ray = new geometry.Ray();
            this.camera.screenPointToRay(position.x, position.y, _ray);
            const rayResult = PhysicsSystem.instance.raycastResults;
            if (PhysicsSystem.instance.raycast(_ray)) {    
                //callback children 
                //this.raycastCallback(rayResult);
                if(this.currentLevelNode!=null) {
                    this.currentLevelNode.getComponent(LevelController).rayResult(rayResult);
                }
            }
        }
    }


}


