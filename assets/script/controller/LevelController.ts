import { _decorator, Component,  geometry, PhysicsSystem, Input, input, EventTouch, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelController')
export class LevelController extends Component {
    private winCallback;
    private loseCallback;
    private rayToChildCallback;
    setUp(winCallback){
        this.winCallback = winCallback;
    }
    public rayResult(raycastResult){
        if(this.rayToChildCallback){
            this.rayToChildCallback(raycastResult);
        }
    }
    //setup raycast callback from prarent class to extend class
    protected setUpRaycastCallback(parentCallback){
        this.rayToChildCallback= parentCallback;
    }
    //
    protected winGame(){
        if(this.winCallback){
            this.winCallback();
        }
    }
    protected loseGame(){
        if(this.loseCallback){
            this.loseCallback();
        }
    }

    onDisable(){
        console.log('disable');
    }
    onDestroy(){
        console.log('destroyed');
    }
    //
    update(deltaTime: number) {
        
    }
}


